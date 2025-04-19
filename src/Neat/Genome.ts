import { DAG, Node, Connection } from './DAG';

export class Genome {
    // private id: number;
    private numInputs: number;
    private numOutputs: number;
    public fitness: number = 0; // Fitness of the genome
    public dag: DAG;

    constructor(numInputs: number, numOutputs: number, dag?: DAG) {
        // this.id = id;
        this.numInputs = numInputs;
        this.numOutputs = numOutputs;
        this.dag = dag ?? new DAG();
    }
    
    evaluate(inputs: number[]): number[] {
        const nodeMap = new Map<number, number>();
        const { nodes, connections } = this.dag;
      
        // Set input node values
        nodes.forEach((node) => {
          if (node.type === "input") {
            const value = inputs.shift();
            if (value === undefined) throw new Error("Not enough inputs");
            nodeMap.set(node.id, value);
          }
        });
      
        // Evaluate all nodes in topological order
        const order = this.dag.getTopologicalOrder();
        for (const node of order) {
          if (node.type === "input") continue;
      
          const incoming = connections.filter(
            (c) => c.to === node.id && c.enabled
          );
      
          const sum = incoming.reduce((acc, conn) => {
            return acc + (nodeMap.get(conn.from) || 0) * conn.weight;
          }, 0);
      
          nodeMap.set(node.id, node.activationFunction(sum)); // or ReLU, tanh, etc.
        } 

        // Collect outputs
        return nodes
        .filter((n) => n.type === "output")
        .map((n) => nodeMap.get(n.id) || 0);
    }
   /*  
    mutateAddConnection() {
        const nodeA = this.dag.getRandomNodeByTypes(["input", "hidden"]);
        const nodeB = this.dag.getRandomNodeByTypes(["hidden", "output"]);

        if (nodeA === null || nodeB === null) return;
        if (nodeA.id === nodeB.id) return;
      
        try {
          this.dag.addConnection({
            from: nodeA.id,
            to: nodeB.id,
            weight: Math.random() * 2 - 1,
            enabled: true,
          });
        } catch (e) {
          // Connection would create cycle — skip
        }
    }
     */
    //getters
    getNumInputs(): number {
        return this.numInputs;
    }

    getNumOutputs(): number {
        return this.numOutputs;
    }
}
