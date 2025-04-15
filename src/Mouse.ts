import { getApp, getEngine } from "./AppInitializer";
import { Mouse, MouseConstraint, World } from "matter-js";


export function createMouse() {
    
    const app = getApp();
    const engine = getEngine()

    const mouse = Mouse.create(app.canvas);
    
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false // Hide the constraint line
            }
        }
    });


    World.add(engine.world, mouseConstraint);
}