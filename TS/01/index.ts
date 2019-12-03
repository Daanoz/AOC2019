import { Puzzle, Runner, BasePuzzle, Result } from '../shared/';

export class PuzzleSolution extends BasePuzzle implements Puzzle {
    public run() {
        const result: Result = {};
        const input: number[] = this.getInputAsRows().map(r => parseInt(r, 10));

        const fuel = input
            .map(n => this.calculateFuel(n))
            .reduce((cur, n) => cur + n, 0);

        result.a = fuel;

        const totalFuel = input
            .map(n => this.calculateRecursiveFuel(n))
            .reduce((cur, n) => cur + n, 0);

        result.b = totalFuel;
        return result;
    }

    private calculateRecursiveFuel(mass: number): number {
        const fuel = this.calculateFuel(mass);
        if (fuel <= 0) { return 0; }
        return fuel + this.calculateRecursiveFuel(fuel);
    }

    private calculateFuel(mass: number): number {
        return Math.floor(mass / 3) - 2;
    }
}

Runner(PuzzleSolution);