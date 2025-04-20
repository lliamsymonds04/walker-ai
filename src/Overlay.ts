export function updateGenerationCounter(generation: number): void {
    document.getElementById("generation")!.innerText = `Generation: ${generation}`;
}