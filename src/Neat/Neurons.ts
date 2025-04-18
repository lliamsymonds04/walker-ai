import {Indexer} from './Indexer';

const genomeIndex = new Indexer();

interface NeuronGene {
    id: number;
    bias: number;
    activationFunction: () => number;
}

interface LinkId {
    from: number;
    to: number;
}

interface LinkGene {
    id: LinkId;
    weight: number;
    enabled: boolean;
}

interface Genome {
    id: number;
    num_inputs: number;
    num_outputs: number;
    neurons: Map<number, NeuronGene>; 
    links: Map<LinkId, LinkGene>; 
}

interface Individual {
    genome: Genome;
    fitness: number;
}

export function crossoverNeuron(parent1: NeuronGene, parent2: NeuronGene): NeuronGene {
    const id = parent1.id;
    const bias = Math.random() < 0.5 ? parent1.bias : parent2.bias;
    const activationFunction = Math.random() < 0.5 ? parent1.activationFunction : parent2.activationFunction;
    return {
        id: id,
        bias: bias,
        activationFunction: activationFunction,
    }
}

export function crossoverLink(parent1: LinkGene, parent2: LinkGene): LinkGene {
    const id = parent1.id;
    const weight = Math.random() < 0.5 ? parent1.weight : parent2.weight;
    const enabled = Math.random() < 0.5 ? parent1.enabled : parent2.enabled;
    return {
        id: id,
        weight: weight,
        enabled: enabled,
    }
}

export function crossoverGenome(dominant: Individual, recessive: Individual): Genome {

    var newGeonome: Genome = {
        id: genomeIndex.next(),
        num_inputs: dominant.genome.num_inputs,
        num_outputs: dominant.genome.num_outputs,
        neurons: new Map<number, NeuronGene>(), 
        links: new Map<LinkId, LinkGene>(), 
    }; 
    
    // Crossover neurons
    for (const [id, neuron] of dominant.genome.neurons) {
        if (recessive.genome.neurons.has(id)) {
            const neuron1 = neuron;
            const neuron2 = recessive.genome.neurons.get(id)!;
            const newNeuron = crossoverNeuron(neuron1, neuron2);
            newGeonome.neurons.set(id, newNeuron);
        } else {
            newGeonome.neurons.set(id, neuron);
        }
    }

    for (const [id, link] of dominant.genome.links) {
        if (recessive.genome.links.has(id)) {
            const link1 = link;
            const link2 = recessive.genome.links.get(id)!;
            const newLink = crossoverLink(link1, link2);
            newGeonome.links.set(id, newLink);
        } else {
            newGeonome.links.set(id, link);
        }
    }
    
    return newGeonome;
}