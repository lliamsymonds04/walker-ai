import Matter from "matter-js";
import { getEngine } from "../AppInitializer";

const { Bodies, Constraint, World } = Matter;

const legAttachAngle = 20 * Math.PI / 180;
const bottomOfBodyAngle =  -Math.PI / 4;

export class WalkerPhysics {
    private body: Matter.Body;
    private upperRightLeg: Matter.Body;
    private upperLeftLeg: Matter.Body;
    private lowerRightLeg: Matter.Body;
    private lowerLeftLeg: Matter.Body;
    private joints: Matter.Constraint[];

    private bodyParts: {key: string, part: Matter.Body}[] = [];

    constructor(x: number, y: number, r: number, legLength: number, legWidth: number) {
        const collisionCategory = 0x0001; // Define a collision category for the walker

        // Create the body
        this.body = Bodies.circle(x, y, r, {
            collisionFilter: {
                category: collisionCategory,
                mask: 0xFFFF // Collides with everything by default
            }
        });

        const rightHipPos = {
            x: x + Math.floor(Math.cos(bottomOfBodyAngle + legAttachAngle) * r + legWidth / 2),
            y: y + Math.floor(Math.sin(bottomOfBodyAngle + legAttachAngle) * r - legWidth / 2),
        };
        const leftHipPos = {
            x: x + Math.floor(Math.cos(bottomOfBodyAngle - legAttachAngle) * r),
            y: y + Math.floor(Math.sin(bottomOfBodyAngle - legAttachAngle) * r)
        };

        // Create the limbs with collision filters
        this.upperRightLeg = Bodies.rectangle(rightHipPos.x, rightHipPos.y + legLength / 2, legWidth, legLength, {
            collisionFilter: {
                category: collisionCategory,
                mask: ~collisionCategory // Collides with everything except its own category
            }
        });

        this.upperLeftLeg = Bodies.rectangle(leftHipPos.x, leftHipPos.y + legLength / 2, legWidth, legLength, {
            collisionFilter: {
                category: collisionCategory,
                mask: ~collisionCategory
            }
        });

        this.lowerRightLeg = Bodies.rectangle(rightHipPos.x, rightHipPos.y + legLength * 1.5, legWidth, legLength, {
            collisionFilter: {
                category: collisionCategory,
                mask: ~collisionCategory
            }
        });

        this.lowerLeftLeg = Bodies.rectangle(leftHipPos.x, leftHipPos.y + legLength * 1.5, legWidth, legLength, {
            collisionFilter: {
                category: collisionCategory,
                mask: ~collisionCategory
            }
        });

        // Create the joints
        const rightHip = Constraint.create({
            bodyA: this.body,
            bodyB: this.upperRightLeg,
            pointA: { x: rightHipPos.x - x, y: rightHipPos.y - y },
            pointB: { x: legWidth / 2, y: -legLength / 2 }
        });
        const rightKnee = Constraint.create({
            bodyA: this.upperRightLeg,
            bodyB: this.lowerRightLeg,
            pointA: { x: legWidth / 2, y: legLength / 2 },
            pointB: { x: legWidth / 2, y: -legLength / 2 }
        });
        const leftHip = Constraint.create({
            bodyA: this.body,
            bodyB: this.upperLeftLeg,
            pointA: { x: leftHipPos.x - x, y: leftHipPos.y - y },
            pointB: { x: legWidth / 2, y: -legLength / 2 }
        });
        const leftKnee = Constraint.create({
            bodyA: this.upperLeftLeg,
            bodyB: this.lowerLeftLeg,
            pointA: { x: legWidth / 2, y: legLength / 2 },
            pointB: { x: legWidth / 2, y: -legLength / 2 }
        });

        this.joints = [rightHip, rightKnee, leftHip, leftKnee];

        // Add body parts to the array
        this.bodyParts = [
            { key: 'body', part: this.body },
            { key: 'upperRightLeg', part: this.upperRightLeg },
            { key: 'upperLeftLeg', part: this.upperLeftLeg },
            { key: 'lowerRightLeg', part: this.lowerRightLeg },
            { key: 'lowerLeftLeg', part: this.lowerLeftLeg }
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
  
    public getInputs(): void {
        //get the inputs from the limbs, ie, angle, angular velocity, foot distance to ground
    }
    
    public setMotors(): void {
        //set joint angular velocity
    }
    
    public getBodyParts(): {key: string, part: Matter.Body}[] {
        return this.bodyParts; 
    }
    
    public cleanup(): void {
        World.remove(getEngine().world, [this.body, this.upperRightLeg, this.upperLeftLeg, this.lowerRightLeg, this.lowerLeftLeg]);
        World.remove(getEngine().world, this.joints);
    }
  }