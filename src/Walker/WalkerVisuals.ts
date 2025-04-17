import { Sprite, Assets, Graphics} from "pixi.js";
import Matter from "matter-js";
import { getApp } from "../AppInitializer";

const LimbNames = ["upperRightLeg", "upperLeftLeg", "lowerRightLeg", "lowerLeftLeg"];

const bodyTexture = await Assets.load("/assets/FishBody.png"); 
const limbTexture = await Assets.load("/assets/FishLimb.png");

export class WalkerVisuals {
    private visuals: Map<string, Sprite> = new Map<string, Sprite>(); 
    private transparency: number = 1.0; // Default transparency
    private debugGraphics: Graphics; // Placeholder for debug graphics

    constructor(radius: number, legLength: number, legWidth: number) {
        const app = getApp();

        this.transparency = 1.0; // Default transparency
        

        for (let i = 0; i < LimbNames.length; i++) {
            const limbName = LimbNames[i];
            const limbVisual = new Sprite({texture: limbTexture});
            limbVisual.width = legWidth; 
            limbVisual.height = legLength;
            limbVisual.anchor.set(0.5, 0.5);
            this.visuals.set(limbName, limbVisual);
            app.stage.addChild(limbVisual);
        }        
        
        // Convert to texture and make a sprite
        
        const ballSprite = new Sprite({texture: bodyTexture});
        ballSprite.width = radius * 2;
        ballSprite.height = radius * 2;

        // Set anchor to center for easier syncing
        ballSprite.anchor.set(0.5);
        app.stage.addChild(ballSprite);


        this.visuals.set("body", ballSprite);
        
        //setup the debug
        this.debugGraphics = new Graphics();
        app.stage.addChild(this.debugGraphics);
    }
    
    public update(bodyParts: {key:string, part: Matter.Body}[]): void {
        if (this.transparency == 0) return; // If transparency is 0, do not update visuals

        for (var i: number = 0; i < bodyParts.length; i++) {
            const part = bodyParts[i].part;
            const key = bodyParts[i].key;
            const visual = this.visuals.get(key);
            if (visual) {
                visual.x = part.position.x;
                visual.y = part.position.y;
                visual.angle = part.angle;
            }
        }
    }
    
    public drawJoints(joints: Matter.Constraint[]): void {
        this.debugGraphics.clear();

        joints.forEach((constraint) => {
            if (!constraint.bodyA || !constraint.bodyB) return;

            const pointA = Matter.Vector.add(constraint.bodyA.position, constraint.pointA);
            const pointB = Matter.Vector.add(constraint.bodyB.position, constraint.pointB);

                color: 0xff0000,
                width: 2
            }).moveTo(pointA.x, pointA.y).lineTo(pointB.x, pointB.y);
        });
    }
    
    public setTransparency(transparency: number): void {
        if (transparency < 0 || transparency > 1) {
            throw new Error("Transparency must be between 0 and 1.");
        }
        this.visuals.forEach((visual) => {
            visual.alpha = transparency;
        });
        this.transparency = transparency;
    }
    
    public cleanup(): void {
        this.visuals.forEach((visual) => {
            visual.destroy();
        });
        this.visuals.clear();
    }
}