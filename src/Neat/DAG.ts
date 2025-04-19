import { getRandomActivationFunction } from "./ActivationFunctions";

type NodeType = "input" | "hidden" | "output";

export interface Node {
  id: number;
  type: NodeType;
  bias: number;
  activationFunction: (x: number) => number; 
}

export interface Connection {
  from: number;
  to: number;
  weight: number;
  enabled: boolean;
}


export class DAG {
    nodes: Node[] = []; // Array to hold nodes
    connections: Connection[] = []; // Array to hold connections
    private nodeIdCounter: number = 0; // Counter for unique node IDs

    addNode(node: Node): void {
        this.nodes.push(node); // Add a node to the DAG
    }

    addConnection(connection: Connection): void {
        if (this.introducesCycle(connection.from, connection.to)) {
            throw new Error(`Adding this connection would introduce a cycle: ${connection.from} -> ${connection.to}`);
        }
        this.connections.push(connection); // Add a connection to the DAG
    }
    
    isConnected(from: number, to: number): boolean {
        const visited = new Set<number>();
        const stack = [from];

        while (stack.length > 0) {
            const current = stack.pop();
            if (current === undefined) continue;
            if (current === to) return true;
            visited.add(current);
            for (const conn of this.connections) {
                if (conn.enabled && conn.from === current && !visited.has(conn.to)) {
                    stack.push(conn.to);
                }
            }
        }
        return false;
    }


    introducesCycle(from: number, to: number): boolean {
        const visited = new Set<number>();
        const stack = [to];

        while (stack.length > 0) {
          const current = stack.pop();
          if (current === undefined) continue;
          if (current === from) return true;
          visited.add(current);
          for (const conn of this.connections) {
            if (conn.enabled && conn.from === current && !visited.has(conn.to)) {
              stack.push(conn.to);
            }
          }
        }

        return false;
    }
    
    getTopologicalOrder(): Node[] {
        const inDegree = new Map<number, number>();
        const graph = new Map<number, number[]>();

        this.nodes.forEach((node) => inDegree.set(node.id, 0));
        for (const conn of this.connections) {
          if (!conn.enabled) continue;
          graph.set(conn.from, [...(graph.get(conn.from) || []), conn.to]);
          inDegree.set(conn.to, (inDegree.get(conn.to) || 0) + 1);
        }

        const queue = this.nodes.filter((n) => (inDegree.get(n.id) || 0) === 0);
        const result: Node[] = [];

        while (queue.length) {
          const node = queue.shift()!;
          result.push(node);

          for (const neighbor of graph.get(node.id) || []) {
            const degree = inDegree.get(neighbor)! - 1;
            inDegree.set(neighbor, degree);
            if (degree === 0) {
              queue.push(this.nodes.find((n) => n.id === neighbor)!);
            }
          }
        }

        if (result.length !== this.nodes.length) {
          throw new Error("Graph has cycles or disconnected nodes");
        }

        return result;
    }
    
    getRandomNodeByTypes(types: NodeType[]): Node | null {
        const filteredNodes = this.nodes.filter(node => types.includes(node.type));
        if (filteredNodes.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * filteredNodes.length);
        return filteredNodes[randomIndex];
    }

    getRandomConnection(): Connection | null {
        if (this.connections.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * this.connections.length);
        return this.connections[randomIndex];
    }
    
    removeNode(nodeId: number): void {
        for (let i = this.connections.length - 1; i >= 0; i--) {
            if (this.connections[i].from === nodeId || this.connections[i].to === nodeId) {
                this.connections.splice(i, 1); // Remove connections associated with the node
            }
        }
        this.nodes = this.nodes.filter(node => node.id !== nodeId); // Remove the node itself
    }

    private getNextNodeId(): number {
        return this.nodeIdCounter++;
    }
    
    createNewNode(type: NodeType): Node {
        return {
            id: this.getNextNodeId(),
            type: type,
            bias: Math.random() * 2 - 1, // Random bias between -1 and 1
            activationFunction: getRandomActivationFunction(),
        }
    }
}