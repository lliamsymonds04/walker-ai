import { Genome } from "./Genome";
import { crossoverGenomes } from "./Crossover";
import { mutateAddConnection, mutateAddHiddenNode, removeHiddenNode, mutateBias,
    mutateWeight, MutationConfig, resetWeight, toggleConnection, removeConnection} from "./Mutations";
import { tanh } from "./ActivationFunctions";

export interface PopulationConfig {
    size: number;
    numInputs: number;
    numOutputs: number;
    survivalThreshold: number;
}

export class Population {
    public genomes: Genome[] = []; // Array to hold genomes
    private config: PopulationConfig; // Configuration for the population
    private mutationConfig: MutationConfig; // Configuration for mutations

    constructor(config: PopulationConfig, mutationConfig: MutationConfig, genomes?: Genome[]) {
        this.config = config; // Store the configuration
        this.mutationConfig = mutationConfig;
         
        if (genomes) {
            this.genomes = genomes; // If genomes are provided, use them
        } else {
            for (let i = 0; i < config.size; i++) {
                this.genomes.push(createGenome(config.numInputs, config.numOutputs));
            }
        }
    }
    
    sortByFitness(): void {
        this.genomes.sort((a, b) => b.fitness - a.fitness); // Sort genomes by fitness in descending order
    }
    
    reproduce(): Population {

        this.sortByFitness();
        const reproductionCutoff = Math.floor(this.genomes.length * this.config.survivalThreshold); // Calculate number of survivors

        const newGeneration: Genome[] = []; // Array to hold new genomes
        
        for (let i = 0; i < this.config.size; i++) {
            //choose 2 random parents from survivors
            const parent1 = chooseRandomGenomeInRange(this.genomes, reproductionCutoff); 
            const parent2 = chooseRandomGenomeInRange(this.genomes, reproductionCutoff);

            const child = crossoverGenomes(parent1, parent2); 

            //mutate the child genome
            this.mutateGenome(child);
            
            newGeneration.push(child); // Add the child genome to the new generation
        }

        // return newGeneration;
        return new Population(this.config, this.mutationConfig, newGeneration); 
    }
    
    mutateGenome(g: Genome): void {
        //non structural mutations
        if (Math.random() < this.mutationConfig.mutateWeightChance)
             mutateWeight(g, this.mutationConfig.mutationStrength);
        if (Math.random() < this.mutationConfig.resetWeightChance) resetWeight(g);
        if (Math.random() < this.mutationConfig.toggleConnectionChance) toggleConnection(g); // Toggle a random connection
        if (Math.random() < this.mutationConfig.mutateBiasChance) mutateBias(g, this.mutationConfig.mutationStrength);

        //structural mutations
        if (Math.random() < this.mutationConfig.addHiddenNodeChance) mutateAddHiddenNode(g);
        if (Math.random() < this.mutationConfig.removeHiddenNodeChance) removeHiddenNode(g);
        if (Math.random() < this.mutationConfig.addConnectionChance) mutateAddConnection(g);
        if (Math.random() < this.mutationConfig.removeConnectionChance) removeConnection(g); 
    }
}

function createGenome(numInputs: number, numOutputs: number): Genome {
    const newGenome = new Genome(numInputs, numOutputs);
    
    //create input nodes
    for (let i = 0; i < numInputs; i++) {
        const id = -numInputs + i; // Negative IDs for input nodes
        newGenome.dag.addNode({
            id: id,
            type: "input",
            bias: 0,
            activationFunction: (x) => x, // Identity function for input nodes
        });
    }
    
    //create output nodes
    for (let i = 0; i < numOutputs; i++) {
        const outputId = i;
        newGenome.dag.addNode({
            id: outputId,
            type: "output",
            bias: Math.random() * 2 - 1, // Random bias between -1 and 1
            activationFunction: tanh, 
        });
            
        for (let j = 0; j < numInputs; j++) {
            //connect the input to the new output
            const inputId = -numInputs + j; // Negative IDs for input nodes
            newGenome.dag.addConnection({
                from: inputId,
                to: outputId,
                weight: Math.random() * 2 - 1, // Random weight between -1 and 1
                enabled: true,
            });
        }
    }
    
    newGenome.dag.updateNodeCounter();

    return newGenome
}

function chooseRandomGenomeInRange(genomes: Genome[], max: number): Genome {
    const randomIndex = Math.floor(Math.random() * max);
    return genomes[randomIndex]; // Return a random genome from the array 
}