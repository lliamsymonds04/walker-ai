import Matter from "matter-js";
import { getEngine } from "../AppInitializer";
import { createLimb, makeConnector, getAngleInfo, setAngularVelocity} from "./ConstraintHelpers";
import { getGroundHeight } from "../Ground";

const { Bodies, World } = Matter;

const legAttachAngle = 35;
const maxAngularVelocity = 0.6;
const tau = Math.PI * 2;
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
    
    constructor(id: number, x: number, y: number, radius: number, legLength: number, legWidth: number) {
        this.startingX = x;
        this.radius = radius;
        this.legLength = legLength;
        
        const size = radius * 2; // Define the size of the body

        // Create the body
        const bodyCategory = 2 << id; // Define a collision category for the body
        const limbCategory = 16 << id;
        /* this.body = Bodies.circle(x, y, r, {
            collisionFilter: {
                category: bodyCategory,
                mask: bodyCategory | defaultCategory | limbCategory,
            },
            
        }); */
        this.body = Bodies.rectangle(x, y, size, size, {
            collisionFilter: {
                category: bodyCategory,
                mask: bodyCategory | defaultCategory | limbCategory,
            },
            frictionAir: 0.2,
        });

        const hipOffsetY = 4;
        const legOffset = 0;
        /* const bodyMiddle = {
            x: x + size/2,
            y: y + size/2,
        } */
        x = x + radius;
        y = y + radius;
        const hipOffset = {
            x: size/4,
            y: size/2 + hipOffsetY,
        };
        
        // Create the limbs
        this.upperRightLeg = createLimb(x + hipOffset.x, y + hipOffset.y, legWidth, legLength, bodyCategory, limbCategory);
        this.upperLeftLeg = createLimb(x - hipOffset.x, y + hipOffset.y, legWidth, legLength, bodyCategory, limbCategory);
        this.lowerRightLeg = createLimb(x + hipOffset.x, y + hipOffset.y + legLength + legOffset, legWidth + legOffset, legLength, bodyCategory, limbCategory);
        this.lowerLeftLeg = createLimb(x - hipOffset.x, y + hipOffset.y + legLength + legOffset, legWidth + legOffset, legLength, bodyCategory, limbCategory);

        // Create the joints
        const rightHip = makeConnector(this.body, this.upperRightLeg, hipOffset.x, hipOffset.y, 0, -legLength / 2);
        const leftHip = makeConnector(this.body, this.upperLeftLeg, -hipOffset.x, hipOffset.y, 0, -legLength / 2);
        const rightKnee = makeConnector(this.upperRightLeg, this.lowerRightLeg, 0, legLength / 2, 0, -legLength / 2 - legOffset);
        const leftKnee = makeConnector(this.upperLeftLeg, this.lowerLeftLeg, 0, legLength / 2, 0, -legLength / 2 - legOffset);

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
        
            // newAngles.push(angleInfo.angle/tau); // Normalize the angle to [0, 1]
            const normalizedAngle = ((angleInfo.angle % tau) + tau) % tau; // Normalize to [0, tau)
            newAngles.push(normalizedAngle / tau); // Normalize the angle to [0, 1]

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
        //dont constriant the upper legs
        Matter.Body.setAngularVelocity(this.upperRightLeg, ru * maxAngularVelocity);
        Matter.Body.setAngularVelocity(this.upperLeftLeg, lu * maxAngularVelocity);
        // Matter.Body.setAngularVelocity(this.lowerRightLeg, rl * maxAngularVelocity);
        // Matter.Body.setAngularVelocity(this.lowerLeftLeg, ll * maxAngularVelocity); 
        // console.log("ru: ", this.upperRightLeg.angle - this.body.angle, "lu: ", this.upperLeftLeg.angle - this.body.angle, "rl: ", this.lowerRightLeg.angle - this.upperRightLeg.angle, "ll: ", this.lowerLeftLeg.angle - this.upperLeftLeg.angle);
        // setAngularVelocity(this.upperRightLeg, ru * maxAngularVelocity, this.body, Math.PI/3);
        // setAngularVelocity(this.upperLeftLeg, lu * maxAngularVelocity, this.body, Math.PI/3);
        
        //constrain the lower legs
        setAngularVelocity(this.lowerRightLeg, rl * maxAngularVelocity, this.upperRightLeg, Math.PI/4);
        setAngularVelocity(this.lowerLeftLeg, ll * maxAngularVelocity, this.upperLeftLeg, Math.PI/4);
    }
    
    public getBodyParts(): {key: string, part: Matter.Body}[] {
        return this.bodyParts; 
    }
    
    private isBodyTouchingGround(): boolean {
        const groundHeight = getGroundHeight();
        const bodyY = this.body.position.y;
        const distance = (groundHeight - bodyY);

        return distance < this.radius + this.legLength * 0.5;
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