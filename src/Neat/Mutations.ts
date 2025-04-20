import { Genome } from "./Genome";

export interface MutationConfig {
    addConnectionChance: number;
    removeConnectionChance: number;
    addHiddenNodeChance: number;
    removeHiddenNodeChance: number;
    mutateWeightChance: number;
    resetWeightChance: number;
    toggleConnectionChance: number;
    mutateBiasChance: number;
    mutationStrength: number;
}

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

export function removeConnection(genome: Genome): void {
    const numConnections = genome.dag.connections.length;
    if (numConnections === 0) return; // No connections to remove

    const index = Math.floor(Math.random() * numConnections);
    genome.dag.connections.splice(index, 1); // Remove the connection from the array
}

export function mutateAddHiddenNode(genome: Genome): void {
    const oldConnection = genome.dag.getRandomConnection();
    if (!oldConnection) return; // No connections to mutate

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
    const node = genome.dag.getRandomNodeByTypes(["hidden"]);
    if (!node) return; // No hidden nodes to remove

    genome.dag.removeNode(node.id); // Remove the node from the DAG
}

//Non-structural mutations
export function mutateWeight(genome: Genome, mutationStrength: number): void {
    const connection = genome.dag.getRandomConnection();
    if (!connection) return; // No connections to mutate
    
    connection.weight += (Math.random() * 2 - 1) * mutationStrength; // Mutate the weight
}

export function resetWeight(genome: Genome): void {
    const connection = genome.dag.getRandomConnection();
    if (!connection) return; // No connections to reset

    connection.weight = Math.random() * 2 - 1; // Reset the weight to a random value
}

export function toggleConnection(genome: Genome): void {
    const connection = genome.dag.getRandomConnection();
    if (!connection) return; // No connections to toggle

    connection.enabled = !connection.enabled; // Toggle the enabled state
}

export function mutateBias(genome: Genome, mutationStrength: number): void {
    const node = genome.dag.getRandomNodeByTypes(["hidden", "output"]);
    if (!node) return; // No nodes to mutate

    node.bias += (Math.random() * 2 - 1) * mutationStrength; // Mutate the bias
}