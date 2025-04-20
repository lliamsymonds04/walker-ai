import { Simulator } from "./Simulator";
import { Engine } from "matter-js";
import { updateGenerationCounter, setupSpeedSlider } from "../Overlay";

const SimulationLifespan = 10 //seconds

export class SimulationHandler {
    private stepsPerUpdate: number = 3; // Number of steps to take per update
    private simulator: Simulator; 
    private engine: Engine; // Matter.js engine
    private generation: number = 0; // Current generation number

    constructor(engine: Engine, populationSize: number) {
        this.engine = engine;

        //create the initial simulator
        const simulatorConfig = {
            populationSize: populationSize,
            survivalThreshold: 0.2,
            walkerTransparency: 0.5,
        };
        this.simulator = new Simulator(simulatorConfig);
        updateGenerationCounter(this.generation); //init the counter 
        setupSpeedSlider(this.stepsPerUpdate, (x: number) => {
            this.stepsPerUpdate = Math.floor(x);
        }); //init the speed slider
    }
    
    public update(dt: number): void {
        var isSimulationFinished = false;
        for (let i = 0; i < this.stepsPerUpdate; i++) {
            Engine.update(this.engine,dt);
            
            const aliveCount = this.simulator.update(dt);
            
            if (this.simulator.getAliveTime() > SimulationLifespan * 1000 || aliveCount == 0) {
                isSimulationFinished = true;
                break;
            }
        }
        
        this.simulator.render();
        
        if (isSimulationFinished) {
            //create a new simulation
            this.newGeneration();
        }
    }
    
    private newGeneration(): void {
        this.generation++;
        const newSimulator = this.simulator.makeNewGeneration();
        this.simulator = newSimulator;
        updateGenerationCounter(this.generation); 
    }
}