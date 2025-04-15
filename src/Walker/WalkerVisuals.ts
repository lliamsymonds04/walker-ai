import { Sprite, Texture, Graphics} from "pixi.js";
import { getApp } from "../AppInitializer";

const LimbNames = ["upperRightLeg", "upperLeftLeg", "lowerRightLeg", "lowerLeftLeg"];

export class WalkerVisuals {
    private visuals: Map<string, Sprite> = new Map<string, Sprite>(); 

    constructor(radius: number, legLength: number, legWidth: number) {
        const app = getApp();

        for (let i = 0; i < LimbNames.length; i++) {
            const limbName = LimbNames[i];
            const limbVisual = new Sprite({texture: Texture.WHITE});
            limbVisual.width = legWidth; 
            limbVisual.height = legLength;
            limbVisual.anchor.set(0.5, 0.5);
            this.visuals.set(limbName, limbVisual);
            app.stage.addChild(limbVisual);
        }        

        const ballGraphics = new Graphics();
        
        ballGraphics.fill(0xFFA500);
        ballGraphics.circle(0, 0, radius);

        // Convert to texture and make a sprite
        const ballTexture = app.renderer.generateTexture(ballGraphics);
        const ballSprite = new Sprite(ballTexture);
        ballSprite.width = radius * 2;
        ballSprite.height = radius * 2;

        // Set anchor to center for easier syncing
        ballSprite.anchor.set(0.5);
        app.stage.addChild(ballSprite);

        this.visuals.set("body", ballSprite);
    }
    
    public update(bodyParts: {key:string, part: Matter.Body}[]): void {
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
    
    public cleanup(): void {
        this.visuals.forEach((visual) => {
            visual.destroy();
        });
        this.visuals.clear();
    }
}