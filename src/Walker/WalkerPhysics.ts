import Matter from "matter-js";
import { getEngine } from "../AppInitializer";
import { createLimb, makeConnector, applyTorque } from "./ConstraintHelpers";
import { getGroundHeight } from "../Ground";

const { Bodies, World } = Matter;

const legAttachAngle = 35;

const collisionCategory = 0x0001; // Define a collision category for the walker

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
    private previousAngles: Map<string, number> = new Map<string, number>();
    
    constructor(x: number, y: number, r: number, legLength: number, legWidth: number) {
        this.startingX = x;
        this.radius = r;
        this.legLength = legLength;

        // Create the body
        this.body = Bodies.circle(x, y, r, {
            collisionFilter: {
                group: -1,
                category: collisionCategory,
                mask: 0xFFFF // Collides with everything by default
            },
        });

        const hipRadiusOffset = 2;
        const angle = (90 - legAttachAngle) * Math.PI / 180;
        const hipOffset = {
            x: Math.ceil(Math.cos(angle) * (r + hipRadiusOffset)),
            y: Math.ceil(Math.sin(angle) * (r + hipRadiusOffset)),
        };
        
        // Create the limbs
        this.upperRightLeg = createLimb(x + hipOffset.x, y + hipOffset.y, legWidth, legLength, collisionCategory);
        this.upperLeftLeg = createLimb(x - hipOffset.x, y + hipOffset.y, legWidth, legLength, collisionCategory);
        this.lowerRightLeg = createLimb(x + hipOffset.x, y + hipOffset.y + legLength, legWidth, legLength, collisionCategory);
        this.lowerLeftLeg = createLimb(x - hipOffset.x, y + hipOffset.y + legLength, legWidth, legLength, collisionCategory);

        // Create the joints
        const rightHip = makeConnector(this.body, this.upperRightLeg, hipOffset.x, hipOffset.y, 0, -legLength / 2);
        const leftHip = makeConnector(this.body, this.upperLeftLeg, -hipOffset.x, hipOffset.y, 0, -legLength / 2);
        const rightKnee = makeConnector(this.upperRightLeg, this.lowerRightLeg, 0, legLength / 2, 0, -legLength / 2);
        const leftKnee = makeConnector(this.upperLeftLeg, this.lowerLeftLeg, 0, legLength / 2, 0, -legLength / 2);

        this.joints = [rightHip, rightKnee, leftHip, leftKnee];

        // Add body parts to the array
        this.bodyParts = [
            { key: 'body', part: this.body },
            { key: 'upperRightLeg', part: this.upperRightLeg },
            { key: 'upperLeftLeg', part: this.upperLeftLeg },
            { key: 'lowerRightLeg', part: this.lowerRightLeg },
            { key: 'lowerLeftLeg', part: this.lowerLeftLeg }
        ];
        
        // Store the previous angles for each limb
        for (var i = 0; i < this.bodyParts.length; i++) {
            this.previousAngles.set(this.bodyParts[i].key, this.bodyParts[i].part.angle);
        }

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
  
    public getInputs(dt: number) {
        //get the inputs from the limbs, ie, angle, angular velocity, foot distance to ground
        
        //calculate the angular velocity of the limbs
        var newAngles = new Map<string, number>();
        const angularVelocities = new Map<string, number>();

        
        for (var i = 0; i < this.bodyParts.length; i++) {
            const prev_angle = this.previousAngles.get(this.bodyParts[i].key)!;
            const new_angle = this.bodyParts[i].part.angle;
            const angular_velocity = (new_angle - prev_angle) / dt;

            angularVelocities.set(this.bodyParts[i].key, angular_velocity);
            newAngles.set(this.bodyParts[i].key, new_angle);
            
            this.previousAngles.set(this.bodyParts[i].key, new_angle);
        }
        
        // Calculate the distance to the ground for the feet
        
        const groundHeight = getGroundHeight();
        const leftFootY = this.lowerLeftLeg.position.y + Math.sin(this.lowerLeftLeg.angle) * this.legLength / 2;
        const rightFootY = this.lowerRightLeg.position.y + Math.sin(this.lowerRightLeg.angle) * this.legLength / 2;
        const leftFootDistance = Math.abs(leftFootY - groundHeight);
        const rightFootDistance = Math.abs(rightFootY - groundHeight);
               
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
        
        //set joint angular velocity
        this.upperRightLeg.torque = ru;
        this.upperLeftLeg.torque = lu;
        this.lowerRightLeg.torque = rl;
        this.lowerLeftLeg.torque = ll;

        Matter.Body.applyForce(this.upperRightLeg, this.upperRightLeg.position, {x: 0, y: -1});
    }
    
    public getBodyParts(): {key: string, part: Matter.Body}[] {
        return this.bodyParts; 
    }
    
    public isBodyTouchingGround(): boolean {
        const groundHeight = getGroundHeight();
        const bodyY = this.body.position.y;
        const distance = (groundHeight - bodyY);

        return distance < this.radius + 5;
    }
    
    public getJoints(): Matter.Constraint[] {
        return this.joints;
    }
    
    public cleanup(): void {
        World.remove(getEngine().world, [this.body, this.upperRightLeg, this.upperLeftLeg, this.lowerRightLeg, this.lowerLeftLeg]);
        World.remove(getEngine().world, this.joints);
    }
}