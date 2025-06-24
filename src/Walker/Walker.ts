import { WalkerPhysics } from "./WalkerPhysics";
import { WalkerVisuals } from "./WalkerVisuals";

const legThickness = 0.4;
const outputScaler = 0.15;

export class Walker {
    private id: number;
    private physics: WalkerPhysics;
    private visuals: WalkerVisuals;
    private alive: boolean = true;
    
    constructor(id: number, x: number, y: number, r: number, legLength: number) {
        this.id = id;
        
        const legWidth = Math.floor(r * legThickness);
        this.physics = new WalkerPhysics(id, x, y, r, legLength, legWidth);
        this.visuals = new WalkerVisuals(r, legLength, legWidth);
        this.visuals.init()
        
        this.update();
    }
    
    public update(): void {
        if (!this.alive) return; // If not alive, do not update
        
        this.visuals.update(this.physics.getBodyParts());
    }
    
    public getFitness(): number {
        return this.physics.getDistanceTravelled();
    }
    
    public getInputs(): number[] {
        //check the robot hasnt fallen over
        if (this.alive) {
            if (this.physics.shouldDie()) {
                this.destroy();
            }
        }

        const inputs = this.physics.getInputs();
        
        //convert map to array
        const outputs: Array<number> = inputs.angles.concat(inputs.angularVelocities); 
        
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
    
    public isAlive() {
       return this.alive; 
    }

    public destroy(): void {
        if (!this.alive) return; // If already destroyed, do nothing

        this.alive = false;
        this.physics.cleanup();
        this.visuals.cleanup();
    }

    public getId(): number {
        return this.id;
    }
    
    public setTransparency(transparency: number): void {
        this.visuals.setTransparency(transparency);
    }
}

export function getNumInputs(): number {
    return 12;
}

export function getNumOutputs(): number {
    return 4;
}