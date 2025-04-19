import { Genome } from "./Genome";
import { sigmoid } from "./ActivationFunctions";

export function mutateAddConnection(genome: Genome): void {
    const nodeA = genome.dag.getRandomNodeByTypes(["input", "hidden"]);
    const nodeB = genome.dag.getRandomNodeByTypes(["hidden", "output"]);
    
    if (nodeA === null || nodeB === null) return;
    if (nodeA.id === nodeB.id) return;
  
    try {
      genome.dag.addConnection({
        from: nodeA.id,
        to: nodeB.id,
        weight: Math.random() * 2 - 1,
        enabled: true,
      });
    } catch (e) {
      // Connection would create cycle — skip
    }
}

export function removeLink(genome: Genome): void {
    const numConnections = genome.dag.connections.length;
    if (numConnections === 0) return; // No connections to remove

    const index = Math.floor(Math.random() * numConnections);
    genome.dag.connections.splice(index, 1); // Remove the connection from the array
}

export function mutateAddHiddenNode(genome: Genome): void {

    const numConnections = genome.dag.connections.length;
    if (numConnections === 0) return; // No connections to mutate

    const index = Math.floor(Math.random() * numConnections);
    const oldConnection = genome.dag.connections[index];
    oldConnection.enabled = false; // Disable the original connection
    
    const newNode = genome.dag.createNewNode("hidden");

    genome.dag.addNode(newNode); // Add the new node to the DAG
    
    //add the new connections
    genome.dag.addConnection({
        from: oldConnection.from,
        to: newNode.id,
        weight: 1, 
        enabled: true,
    });
    genome.dag.addConnection({
        from: newNode.id,
        to: oldConnection.to,
        weight: oldConnection.weight, 
        enabled: true,
    });
}

export function removeHiddenNode(genome: Genome): void {
    // const hiddenNodes = genome.dag.nodes.filter(node => node.type === "hidden");
    const node = genome.dag.getRandomNodeByTypes(["hidden"]);
    if (!node) return; // No hidden nodes to remove

    genome.dag.removeNode(node.id); // Remove the node from the DAG
}