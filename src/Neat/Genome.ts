import { Link, LinkId } from './Link';
import { Node } from './Node';

export class Genome {
    private id: number;
    private numInputs: number;
    private numOutputs: number;
    private isOffspring: boolean;
    private neurons: Map<number, Node>;
    private links: Map<LinkId, Link>;

    constructor(id: number, numInputs: number, numOutputs: number, isOffspring: boolean = false) {
        this.id = id;
        this.numInputs = numInputs;
        this.numOutputs = numOutputs;
        this.isOffspring = isOffspring;
        this.neurons = new Map<number, Node>();
        this.links = new Map<LinkId, Link>();
    }
}