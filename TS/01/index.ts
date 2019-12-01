import { Puzzle, Runner, BasePuzzle } from '../shared/';

class PuzzleSolution extends BasePuzzle implements Puzzle {
    public run() {
        const input: number[] = this.getInputAsRows().map(r => parseInt(r, 10));
        
        const fuel = input
            .map(n => this.calculateFuel(n))
            .reduce((cur, n) => cur + n, 0);

        console.log("Part A", fuel);


        const totalFuel = input
            .map(n => this.calculateRecusiveFuel(n))
            .reduce((cur, n) => cur + n, 0);

        console.log("Part B", totalFuel); 
    }

    private calculateRecusiveFuel(mass: number): number {
        const fuel = this.calculateFuel(mass);
        if (fuel <= 0) { return 0; } 
        return fuel + this.calculateRecusiveFuel(fuel);
    }

    private calculateFuel(mass: number): number {
        return Math.floor(mass / 3) - 2;
    }
}

Runner(PuzzleSolution);