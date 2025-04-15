import { Application } from "pixi.js";
import Matter from "matter-js";

const App = new Application();
const engine = Matter.Engine.create();

function getApp(): Application {
    return App;
}

function getEngine(): Matter.Engine {
    return engine;
}