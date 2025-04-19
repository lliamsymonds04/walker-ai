export class LinkId {
    public from: number; // The ID of the neuron this link comes from
    public to: number; // The ID of the neuron this link goes to
    
    constructor(from: number, to: number) {
        this.from = from;
        this.to = to;
    }
}

export class Link {
    private weight: number; // The weight of the link
    private enabled: boolean; // Whether the link is enabled or not

    constructor(weight: number, enabled: boolean) {
        this.weight = weight;
        this.enabled = enabled;
    }
}