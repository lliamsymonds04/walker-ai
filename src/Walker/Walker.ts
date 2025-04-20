import { WalkerPhysics } from "./WalkerPhysics";
import { WalkerVisuals } from "./WalkerVisuals";

const legThickness = 0.4;
const outputScaler = 0.05;

export class Walker {
    private id: number;
    private physics: WalkerPhysics;
    private visuals: WalkerVisuals;
    private alive: boolean = true;
    
    constructor(id: number, x: number, y: number, r: number, legLength: number) {
        this.id = id;
        
        const legWidth = Math.floor(r * legThickness);
        this.physics = new WalkerPhysics(x, y, r, legLength, legWidth);
        this.visuals = new WalkerVisuals(r, legLength, legWidth);
    }
    
    public update(): void {
        this.visuals.update(this.physics.getBodyParts());
        // this.visuals.drawJoints(this.physics.getJoints());
    }
    
    public getFitness(): number {
        return this.physics.getDistanceTravelled();
    }
    
    public getInputs(dt: number): number[] {
        //check the robot hasnt fallen over
        if (this.alive) {
            if (this.physics.isBodyTouchingGround()) {
                this.alive = false;
            }
        }

        const inputs = this.physics.getInputs(dt);
        
        //convert map to array
        const outputs = []

        for (const [_, value] of inputs.angles) {
            outputs.push(value);
        }
        for (const [_, value] of inputs.angularVelocities) {
            outputs.push(value);
        }
        outputs.push(inputs.leftFootDistance);
        outputs.push(inputs.rightFootDistance);

        return outputs;
    }
    
    public setOutputs(outputs: number[]): void {
        this.physics.setMotors(
            outputs[0] * outputScaler,
            outputs[1] * outputScaler,
            outputs[2] * outputScaler,
            outputs[3] * outputScaler
        );
    }
    
    isAlive() {
       return this.alive; 
    }

    public destroy(): void {
        this.physics.cleanup();
        this.visuals.cleanup();
    }

    public getId(): number {
        return this.id;
    }
}

export function getNumInputs(): number {
    return 12;
}

export function getNumOutputs(): number {
    return 4;
}