import { WalkerPhysics } from "./WalkerPhysics";
import { WalkerVisuals } from "./WalkerVisuals";

const legThickness = 0.4;

export class Walker {
    private id: number;
    private physics: WalkerPhysics;
    private visuals: WalkerVisuals;
    
    constructor(id: number, x: number, y: number, r: number, legLength: number) {
        this.id = id;
        
        const legWidth = Math.floor(r * legThickness);
        this.physics = new WalkerPhysics(x, y, r, legLength, legWidth);
        this.visuals = new WalkerVisuals(r, legLength, legWidth);
    }
    
    public update(): void {
        this.visuals.update(this.physics.getBodyParts());
        // console.log(this.physics.getBodyParts()[0].part.position.x, this.physics.getBodyParts()[0].part.position.y);
        this.visuals.drawJoints(this.physics.getJoints());
    }

    public cluneup(): void {
        this.physics.cleanup();
        this.visuals.cleanup();
    }

    public getId(): number {
        return this.id;
    }
}