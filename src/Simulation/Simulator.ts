import { Population } from "../Neat/Population";
import { Walker, getNumInputs, getNumOutputs } from "../Walker/Walker";
import { getGroundHeight } from "../Ground";

interface simulatorConfig {
    populationSize: number;
    survivalThreshold: number;
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

    constructor(config: simulatorConfig, population?: Population) {
        this.config = config;
        
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
        
        //create the walkers
        const groundHeight = getGroundHeight();
        const startingY = groundHeight - WalkerRadius - WalkerLegLength * 3;
        const startingX = StartingX + WalkerRadius;
        for (let i = 0; i < this.population.genomes.length; i++) {
            const walker = new Walker(i, startingX, startingY, WalkerRadius, WalkerLegLength);
            this.walkers.push(walker); 
        }
    }

    //returns the number of walkers alive
    update(dt: number): number {
        var walkersAlive = 0;

        this.aliveTime += dt; // Increment alive time
        this.population.genomes.forEach((genome, i) => {
            const walker = this.walkers[i];
            if (walker.isAlive()) {
                walkersAlive++; // Count alive walkers
                
                const inputs = walker.getInputs(dt); // Get inputs from the walker
                const outputs = genome.evaluate(inputs); 

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
        //set the fitness of each genome
        this.population.genomes.forEach((genome, i) => {
            genome.fitness = getWalkerFitness(this.walkers[i]);
        })
        
        //cleanup all the walkers
        this.walkers.forEach(w => w.destroy());
        this.walkers = [];
        
        const newPop = this.population.reproduce(); // Reproduce the population

        return new Simulator(this.config, newPop); 
    }
    
    getAliveTime(): number {
        return this.aliveTime;
    }
}

function getWalkerFitness(w: Walker): number {
    //helper function incase i want to extend the fitness function later
    return w.getFitness();
}