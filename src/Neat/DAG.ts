type NodeType = "input" | "hidden" | "output";

interface Node {
  id: number;
  type: NodeType;
  value?: number;
}

interface Connection {
  from: number;
  to: number;
  weight: number;
  enabled: boolean;
}


export class DAG {
    nodes: Node[] = []; // Array to hold nodes
    connections: Connection[] = []; // Array to hold connections

    addNode(node: Node): void {
        this.nodes.push(node); // Add a node to the DAG
    }

    addConnection(connection: Connection): void {
        if (this.introducesCycle(connection.from, connection.to)) {
            throw new Error(`Adding this connection would introduce a cycle: ${connection.from} -> ${connection.to}`);
        }
        this.connections.push(connection); // Add a connection to the DAG
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
}