import Matter from "matter-js";
import { TilingSprite, Assets } from "pixi.js";
import { getApp, getEngine } from "./AppInitializer";

let groundHeight = 0

export async function createGround(height: number) {
    const app = getApp();
    const engine = getEngine()
    const { Bodies, World } = Matter;
    
    const ground = Bodies.rectangle(
       app.screen.width / 2,
       app.screen.height - height/2,
       app.screen.width * 10,
       height,
       { isStatic: true }
    );

    World.add(engine.world, ground);
    
    const texture = await Assets.load("/assets/sand.png");

    //create visuals
    const groundVisual = new TilingSprite({
        texture,
        width: app.screen.width,
        height: height,
    })
    
    groundVisual.anchor.set(0, 0.5);
    groundVisual.y = app.screen.height - height/2;
    
    app.stage.addChild(groundVisual);
    
    groundHeight =  app.screen.height - height; 
}

export function getGroundHeight() {
    return groundHeight;
}