type activationFunc = (x: number) => number; // Define the type for activation functions

export class Node {
    private id: number; // The ID of the node
    private layer: number; // The layer of the node in the neural network
    private activationFunction: activationFunc ;
    private bias: number; // The bias of the node
    public isOutput: boolean; // Whether the node is an output node or not
    public isHidden: boolean; // Whether the node is a hidden node or not
    public isInput: boolean; // Whether the node is an input node or not

    private inputSum: number; // The sum of the inputs to the node
    private output: number; // The output of the node

    constructor(id: number, layer: number, activationFunction: activationFunc, 
        bias: number, isOutput: boolean = false, isInput: boolean = false,
         isHidden: boolean = false) {
        this.id = id;
        this.layer = layer;
        this.activationFunction = activationFunction;
        this.bias = bias;
        this.isOutput = isOutput;
        this.isHidden = isHidden;
        this.isInput = isInput;
        
        this.inputSum = 0; // Initialize input sum to 0
        this.output = 0; // Initialize output to 0
    }
    
}