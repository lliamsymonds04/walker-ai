import { Application } from "pixi.js";
import Matter from "matter-js";

const App = new Application();
const engine = Matter.Engine.create();

export function getApp(): Application {
    return App;
}

export function getEngine(): Matter.Engine {
    return engine;
}