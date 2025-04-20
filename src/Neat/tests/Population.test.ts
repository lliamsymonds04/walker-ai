import { describe, it, expect } from 'vitest';
import { Population } from '../Population';

describe('Population', () => {
    const populationConfig = {
        size: 10,
        numInputs: 3,
        numOutputs: 2,
        survivalThreshold: 0.5,
    };

    const mutationConfig = {
        mutateWeightChance: 0.1,
        resetWeightChance: 0.1,
        toggleConnectionChance: 0.1,
        mutateBiasChance: 0.1,
        addHiddenNodeChance: 0.1,
        removeHiddenNodeChance: 0.1,
        mutationStrength: 0.1,
        addConnectionChance: 0.1,
        removeConnectionChance: 0.1,
    };

    it('should initialize with the correct number of genomes', () => {
        const population = new Population(populationConfig, mutationConfig);

        expect(population.genomes.length).toBe(10);
        population.genomes.forEach((genome) => {
            expect(genome.getNumInputs()).toBe(3);
            expect(genome.getNumOutputs()).toBe(2);
        });
    });
});