import Matter from "matter-js";
import { getEngine } from "../AppInitializer";
import { createLimb, makeConnector, applyTorque, getAngleInfo} from "./ConstraintHelpers";
import { getGroundHeight } from "../Ground";

const { Bodies, World } = Matter;

const legAttachAngle = 35;
const maxAngularVelocity = 10;
const tau = Math.PI * 2;
const torqueArmDividor = 8;
const launchVelocity = 100;

const defaultCategory = 0x0001; // Define a collision category for the walker

export class WalkerPhysics {
    private body: Matter.Body;
    private upperRightLeg: Matter.Body;
    private upperLeftLeg: Matter.Body;
    private lowerRightLeg: Matter.Body;
    private lowerLeftLeg: Matter.Body;
    private startingX: number;
    private radius: number;
    private legLength: number;
    private joints: Matter.Constraint[];
    private bodyParts: {key: string, part: Matter.Body}[] = [];
    private jointsInfo: Array<Array<Matter.Body>> = [];
    
    constructor(id: number, x: number, y: number, r: number, legLength: number, legWidth: number) {
        this.startingX = x;
        this.radius = r;
        this.legLength = legLength;

        // Create the body
        this.body = Bodies.circle(x, y, r, {
            collisionFilter: {
                category: 1 << id,
                mask: (1 << id) | defaultCategory,
            },
        });

        const hipRadiusOffset = 2;
        const angle = (90 - legAttachAngle) * Math.PI / 180;
        const hipOffset = {
            x: Math.ceil(Math.cos(angle) * (r + hipRadiusOffset)),
            y: Math.ceil(Math.sin(angle) * (r + hipRadiusOffset)),
        };
        
        // Create the limbs
        this.upperRightLeg = createLimb(x + hipOffset.x, y + hipOffset.y, legWidth, legLength, id);
        this.upperLeftLeg = createLimb(x - hipOffset.x, y + hipOffset.y, legWidth, legLength, id);
        this.lowerRightLeg = createLimb(x + hipOffset.x, y + hipOffset.y + legLength, legWidth, legLength, id);
        this.lowerLeftLeg = createLimb(x - hipOffset.x, y + hipOffset.y + legLength, legWidth, legLength, id);

        // Create the joints
        const rightHip = makeConnector(this.body, this.upperRightLeg, hipOffset.x, hipOffset.y, 0, -legLength / 2);
        const leftHip = makeConnector(this.body, this.upperLeftLeg, -hipOffset.x, hipOffset.y, 0, -legLength / 2);
        const rightKnee = makeConnector(this.upperRightLeg, this.lowerRightLeg, 0, legLength / 2, 0, -legLength / 2);
        const leftKnee = makeConnector(this.upperLeftLeg, this.lowerLeftLeg, 0, legLength / 2, 0, -legLength / 2);

        this.joints = [rightHip, rightKnee, leftHip, leftKnee];
        
        this.bodyParts = [
            {key: "upperRightLeg", part: this.upperRightLeg},
            {key: "upperLeftLeg", part: this.upperLeftLeg},
            {key: "lowerRightLeg", part: this.lowerRightLeg},
            {key: "lowerLeftLeg", part: this.lowerLeftLeg},
            {key: "body", part: this.body},
        ];

        //store the joints relatively        
        this.jointsInfo = [
            [this.body],
            [this.upperRightLeg],
            [this.lowerRightLeg, this.upperRightLeg],
            [this.upperLeftLeg],
            [this.lowerLeftLeg, this.upperLeftLeg],
        ];
        

        // Add parts to the world
        World.add(getEngine().world, [
            this.body,
            this.upperRightLeg,
            this.upperLeftLeg,
            this.lowerRightLeg,
            this.lowerLeftLeg,
            rightHip,
            rightKnee,
            leftHip,
            leftKnee
        ]);
    }
  
    public getInputs() {
        //calculate the angular velocity of the limbs
        var newAngles = []; 
        const angularVelocities = [];

        for (let i = 0; i < this.jointsInfo.length; i++) {
            const v = this.jointsInfo[i];
            const part = v[0];
            const relativeTo = v.length == 2 ? v[1] : undefined;
            
            const angleInfo = getAngleInfo(part, relativeTo);
        
            newAngles.push(angleInfo.angle/tau); // Normalize the angle to [0, 1]

            //normalize and clamp the angular velocity to [0,1]
            var angularVelocity = angleInfo.angularVelocity / maxAngularVelocity;
            angularVelocity = Math.min(Math.max(angularVelocity + 0.5, 0), 1);
            
            angularVelocities.push(angularVelocity); // Normalize the angular velocity to [0,1]
        }

        // Calculate the distance to the ground for the feet
        const groundHeight = getGroundHeight();
        const leftFootY = this.lowerLeftLeg.position.y + Math.sin(this.lowerLeftLeg.angle) * this.legLength / 2;
        const rightFootY = this.lowerRightLeg.position.y + Math.sin(this.lowerRightLeg.angle) * this.legLength / 2;
        var leftFootDistance = Math.abs(leftFootY - groundHeight);
        var rightFootDistance = Math.abs(rightFootY - groundHeight);

        const maxGroundDist = this.legLength * 2;
        leftFootDistance = Math.min(leftFootDistance, maxGroundDist)/maxGroundDist;
        rightFootDistance = Math.min(rightFootDistance, maxGroundDist)/maxGroundDist;
               
        return {
            angles: newAngles,
            angularVelocities: angularVelocities,
            leftFootDistance: leftFootDistance,
            rightFootDistance: rightFootDistance,
        }
    }
    
    public getDistanceTravelled(): number {
        return this.body.position.x - this.startingX;
    }
    
    public setMotors(ru: number, lu: number, rl: number, ll: number): void {
        applyTorque(this.upperRightLeg, ru, Math.floor(this.legLength/torqueArmDividor));
        applyTorque(this.upperLeftLeg, lu, Math.floor(this.legLength/torqueArmDividor));
        applyTorque(this.lowerRightLeg, rl, Math.floor(this.legLength/torqueArmDividor));
        applyTorque(this.lowerLeftLeg, ll, Math.floor(this.legLength/torqueArmDividor));
        
    }
    
    public getBodyParts(): {key: string, part: Matter.Body}[] {
        return this.bodyParts; 
    }
    
    private isBodyTouchingGround(): boolean {
        const groundHeight = getGroundHeight();
        const bodyY = this.body.position.y;
        const distance = (groundHeight - bodyY);

        return distance < this.radius * 1.5;
    }
    
    private isBodyLaunched(): boolean {
        const velY = this.body.velocity.y;
        
        return Math.abs(velY) > launchVelocity;
    }
    
    public shouldDie(): boolean {
        const onGround = this.isBodyTouchingGround();
        if (onGround) return true;

        const isLaunched = this.isBodyLaunched();
        if (isLaunched) return true;

        return false
    }
    
    public getJoints(): Matter.Constraint[] {
        return this.joints;
    }
    
    public cleanup(): void {
        World.remove(getEngine().world, [this.body, this.upperRightLeg, this.upperLeftLeg, this.lowerRightLeg, this.lowerLeftLeg]);
        World.remove(getEngine().world, this.joints);
    }
}