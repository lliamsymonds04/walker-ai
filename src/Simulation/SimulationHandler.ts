import { Simulator } from "./Simulator";
import { Engine } from "matter-js";
import { setupSpeedSlider } from "../Overlay";

const SimulationLifespan = 10 //seconds

export class SimulationHandler {
    private stepsPerUpdate: number = 1; // Number of steps to take per update
    private simulator: Simulator; 
    private engine: Engine; // Matter.js engine

    constructor(engine: Engine, populationSize: number) {
        this.engine = engine;

        //create the initial simulator
        const simulatorConfig = {
            populationSize: populationSize,
            batchSize: 10,
            survivalThreshold: 0.3,
            walkerTransparency: 0.5,
        };
        this.simulator = new Simulator(simulatorConfig,0);
        setupSpeedSlider(this.stepsPerUpdate, (x: number) => {
            this.stepsPerUpdate = Math.floor(x);
        }); //init the speed slider
    }
    
    public update(dt: number): void {
        let isSimulationFinished = false;
        let createNewBatch = false;
        for (let i = 0; i < this.stepsPerUpdate; i++) {
            Engine.update(this.engine,dt);
            
            const aliveCount = this.simulator.update(dt);
            
            if (this.simulator.getAliveTime() > SimulationLifespan * 1000 || aliveCount == 0) {
                if (this.simulator.isFinalBatch()) {
                    isSimulationFinished = true;
                } else {
                    createNewBatch = true;
                }     
                
                break;
            }
        }
        
        this.simulator.render();
        
        if (isSimulationFinished) {
            //create a new simulation
            this.newGeneration();
        } else if (createNewBatch) {
            //create a new batch of walkers
            this.simulator.createNewBatch();
        }
    }
    
    private newGeneration(): void {
        const newSimulator = this.simulator.makeNewGeneration();
        this.simulator = newSimulator;
    }
}