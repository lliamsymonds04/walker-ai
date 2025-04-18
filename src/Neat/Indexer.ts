export class Indexer {
    index: number = 0;

    constructor() {
        this.index = 0;
    }

    public next(): number {
        return this.index++;
    }
}