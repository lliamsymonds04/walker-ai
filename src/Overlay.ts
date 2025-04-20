export function updateGenerationCounter(generation: number): void {
    document.getElementById("generation")!.innerText = `Generation: ${generation}`;
}


export function setupSpeedSlider(intial: number, updateSpeed: (x: number) => void): void {
    const speedSlider = document.getElementById('speed') as HTMLInputElement;
    const speedLabel = document.getElementById('speed-label') as HTMLDivElement;
    
    speedSlider.value = intial.toString();
    speedLabel.textContent = `Speed: ${intial}`;

    speedSlider.addEventListener('input', function () {
        const value = speedSlider.value;
        speedLabel.textContent = `Speed: ${value}`;
        
        updateSpeed(parseFloat(value));
    });
}
