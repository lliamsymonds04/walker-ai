import Matter from "matter-js";
import { getEngine } from "../AppInitializer";

const { Bodies, Constraint, World } = Matter;

const legAttachAngle = 35;

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
            },
        });

        const hipRadiusOffset = 2;
        const angle = (90 - legAttachAngle) * Math.PI / 180;
        const hipOffset = {
            x: Math.ceil(Math.cos(angle) * (r + hipRadiusOffset)),
            y: Math.ceil(Math.sin(angle) * (r + hipRadiusOffset)),
        };
        
        // Create the limbs
        this.upperRightLeg = createLimb(x + hipOffset.x, y + hipOffset.y, legWidth, legLength);
        this.upperLeftLeg = createLimb(x - hipOffset.x, y + hipOffset.y, legWidth, legLength);
        this.lowerRightLeg = createLimb(x + hipOffset.x, y + hipOffset.y + legLength, legWidth, legLength);
        this.lowerLeftLeg = createLimb(x - hipOffset.x, y + hipOffset.y + legLength, legWidth, legLength);

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
    
    public getJoints(): Matter.Constraint[] {
        return this.joints;
    }
    
    public cleanup(): void {
        World.remove(getEngine().world, [this.body, this.upperRightLeg, this.upperLeftLeg, this.lowerRightLeg, this.lowerLeftLeg]);
        World.remove(getEngine().world, this.joints);
    }
  }
  
function makeConnector(bodyA: Matter.Body, bodyB: Matter.Body, ax: number, ay: number, bx: number, by: number): Matter.Constraint {
    return Constraint.create({
        bodyA: bodyA,
        bodyB: bodyB,
        pointA: { x: ax, y: ay },
        pointB: { x: bx, y: by },
        stiffness: 0.7,
        damping: 0.1,
        length: 0,
        
    });
}

function createLimb(x: number, y: number, width: number, height: number): Matter.Body {
    return Bodies.rectangle(x, y, width, height, {
        collisionFilter: {
            category: 0x0001,
            mask: 0xFFFF // Collides with everything by default
        },
        frictionAir: 0.05,
    });
}