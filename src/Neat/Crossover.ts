import { Genome } from "./Genome";
import { DAG, Node, Connection } from "./DAG";


function crossoverNodes(node1: Node, node2: Node): Node {
    if (node1.type !== node2.type) {
        throw new Error("Cannot crossover nodes of different types");
    }
    const bias = Math.random() < 0.5 ? node1.bias : node2.bias;
    const activationFunction = Math.random() < 0.5 ? node1.activationFunction : node2.activationFunction;
    return {
        id: node1.id,
        type: node1.type,
        bias: bias,
        activationFunction: activationFunction,
    }
}

function crossoverConnections(conn1: Connection, conn2: Connection): Connection {
    if (conn1.from !== conn2.from || conn1.to !== conn2.to) {
        throw new Error("Cannot crossover connections with different endpoints");
    }
    const weight = Math.random() < 0.5 ? conn1.weight : conn2.weight;
    const enabled = Math.random() < 0.5 ? conn1.enabled : conn2.enabled;
    return {
        from: conn1.from,
        to: conn1.to,
        weight: weight,
        enabled: enabled,
    }
}

export function crossoverGenomes(parent1: Genome, parent2: Genome): Genome {

    const dominant = parent1.fitness > parent2.fitness ? parent1 : parent2;
    const recessive = parent1.fitness > parent2.fitness ? parent2 : parent1;
    
    const newDAG = new DAG();
    //crossover the nodes
    for (const node of dominant.dag.nodes) {
        const recessiveNode = recessive.dag.nodes.find(n => n.id === node.id);
        if (recessiveNode) {
            const newNode = crossoverNodes(node, recessiveNode);
            newDAG.addNode(newNode);
        } else {
            newDAG.addNode(node);
        }
    }
    
    //crossover the connections
    for (const conn of dominant.dag.connections) {
        const recessiveConn = recessive.dag.connections.find(c => c.from === conn.from && c.to === conn.to);
        if (recessiveConn) {
            const newConn = crossoverConnections(conn, recessiveConn);
            newDAG.addConnection(newConn);
        } else {
            newDAG.addConnection(conn);
        }
    }
    
    return new Genome(dominant.getNumInputs(), dominant.getNumOutputs(), newDAG); 
}