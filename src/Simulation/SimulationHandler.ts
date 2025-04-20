import { Simulator } from "./Simulator";
import { Engine } from "matter-js";

const SimulationLifespan = 10 //seconds

export class SimulationHandler {
    private stepsPerUpdate: number = 1; // Number of steps to take per update
    private simulator: Simulator; 
    private engine: Engine; // Matter.js engine
    private generation: number = 0; // Current generation number

    constructor(engine: Engine, populationSize: number) {
        this.engine = engine;

        //create the initial simulator
        const simulatorConfig = {
            populationSize: populationSize,
            survivalThreshold: 0.5,
        };
        this.simulator = new Simulator(simulatorConfig);
    }
    
    public update(dt: number): void {
        var isSimulationFinished = false;
        for (let i = 0; i < this.stepsPerUpdate; i++) {
            Engine.update(this.engine, dt);
            
            const aliveCount = this.simulator.update(dt);
            
            if (this.simulator.getAliveTime() > SimulationLifespan * 1000 || aliveCount == 0) {
                isSimulationFinished = true;
                break;
            }
        }
        
        if (isSimulationFinished) {
            //create a new simulation
            this.newGeneration();
        }
    }
    
    private newGeneration(): void {
        this.generation++;
        const newSimulator = this.simulator.makeNewGeneration();
        this.simulator = newSimulator;
    }
}