import { Population } from "../Neat/Population";
import { Walker, getNumInputs, getNumOutputs } from "../Walker/Walker";
import { getGroundHeight } from "../Ground";
import { Genome } from "../Neat/Genome";
import { updateGenerationCounter } from "../Overlay";

interface simulatorConfig {
    populationSize: number;
    batchSize: number;
    survivalThreshold: number;
    walkerTransparency: number;
}

//walker parameters
const WalkerRadius = 40;
const WalkerLegLength = 50;
const StartingX = 50;

export class Simulator {
    private population: Population;
    private walkers: Walker[] = [];
    private config: simulatorConfig;
    private aliveTime: number = 0;
    private batch: number = 0; // Current batch number
    private generation: number; // Current generation number

    constructor(config: simulatorConfig, generation: number, population?: Population) {
        this.config = config;
        this.generation = generation;
        
        if (population) {
            this.population = population; // If a population is provided, use it
        } else {
            //create the configs
            const populationConfig = {
                size: config.populationSize,
                numInputs: getNumInputs(), // Example input size
                numOutputs: getNumOutputs(), // Example output size
                survivalThreshold: config.survivalThreshold,
            };
            const mutationConfig = {
                mutateWeightChance: 0.8,
                resetWeightChance: 0.1,
                toggleConnectionChance: 0.05,
                mutateBiasChance: 0.2,
                addHiddenNodeChance: 0.03,
                removeHiddenNodeChance: 0.02,
                mutationStrength: 0.5,
                addConnectionChance: 0.05,
                removeConnectionChance: 0.02,
            };
            
            this.population = new Population(populationConfig, mutationConfig);
        }
         
       this.createNewBatch(); // Create the initial batch of walkers
    }

    //returns the number of walkers alive
    update(dt: number): number {
        var walkersAlive = 0;

        this.aliveTime += dt; // Increment alive time
        this.walkers.forEach((walker, i) => {
            if (walker.isAlive()) {
                walkersAlive++; // Count alive walkers
                
                const inputs = walker.getInputs(); // Get inputs from the walker
                const outputs = this.getWalkerGenome(i).evaluate(inputs); 

                // Set the outputs to the walker
                walker.setOutputs(outputs); 
            }
        });
        return walkersAlive
    }
    
    render(): void {
        this.walkers.forEach(w => w.update()); // Render each walker
    }

    makeNewGeneration(): Simulator {
        //cleanup all the walkers
        this.cleanupWalkers(); // Destroy all walkers
        
        const newPop = this.population.reproduce(); // Reproduce the population

        return new Simulator(this.config, this.generation + 1, newPop); 
    }
    
    private cleanupWalkers(): void {
        this.walkers.forEach((walker, i) => {
            this.getWalkerGenome(i).fitness = getWalkerFitness(walker); // Set the fitness of the genome
            walker.destroy(); // Destroy the walker
        });
        this.walkers = []; // Clear the walkers array
    }
    
    private createWalkers(n: number): void {
        const groundHeight = getGroundHeight();
        const startingY = groundHeight - WalkerRadius - WalkerLegLength * 2;
        const startingX = StartingX + WalkerRadius;
        for (let i = 0; i < n; i++) {
            const walker = new Walker(i, startingX, startingY, WalkerRadius, WalkerLegLength);
            walker.setTransparency(this.config.walkerTransparency);
            this.walkers.push(walker); 
        }
    }
    
    createNewBatch(): void {
        if (this.batch > 0) {
            //cleanup the previous batch of walkers
            this.cleanupWalkers(); // Destroy the previous batch of walkers
            this.aliveTime = 0; // Reset alive time for the new batch
        }

        const remainingWalkers = this.config.populationSize - this.batch * this.config.batchSize;
        const newBatchSize = Math.min(this.config.batchSize, remainingWalkers);
        

        this.batch += 1;
        this.createWalkers(newBatchSize); // Create new walkers for the batch
        
        updateGenerationCounter(this.generation, this.batch); // Update the generation and batch counter in the UI
    }
    
    private getWalkerGenome(walker_index: number): Genome {
       const i = walker_index + (this.batch - 1) * this.config.batchSize; 

       return this.population.genomes[i]; // Get the genome for the walker
    }
    
    isFinalBatch(): boolean {
        return this.batch * this.config.batchSize >= this.config.populationSize; // Check if it's the final batch
    }
    
    getAliveTime(): number {
        return this.aliveTime;
    }
}



function getWalkerFitness(w: Walker): number {
    //helper function incase i want to extend the fitness function later
    return w.getFitness();
}