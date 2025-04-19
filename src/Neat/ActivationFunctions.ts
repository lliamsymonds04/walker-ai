export function sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x)); // Sigmoid activation function
}

export function relu(x: number): number {
    return Math.max(0, x); // ReLU activation function
}

export function tanh(x: number): number {
    return Math.tanh(x); // Tanh activation function
}

export function getRandomActivationFunction(): (x: number) => number {
    const functions = [sigmoid, relu, tanh];
    const randomIndex = Math.floor(Math.random() * functions.length);
    return functions[randomIndex];
}