import { describe, it, expect } from 'vitest';
import { Genome } from '../Genome';
import { DAG } from '../DAG';
import { identity } from '../ActivationFunctions';


describe('Genome', () => {
    it('should evaluate inputs correctly', () => {
        const dag = new DAG();
        // Add nodes and connections to the DAG for testing
        dag.addNode({ id: 0, type: 'input', bias: 0, activationFunction: identity });
        dag.addNode({ id: 1, type: 'output', bias: 0, activationFunction: identity });
        dag.addConnection({ from: 0, to: 1, weight: 1, enabled: true });

        const genome = new Genome(1, 1, dag);
        const result = genome.evaluate([5]);

        expect(result).toEqual([5]);
    });
});