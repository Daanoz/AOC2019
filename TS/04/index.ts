import { Puzzle, Runner, BasePuzzle, Result } from '../shared/';

export class PuzzleSolution extends BasePuzzle implements Puzzle {
    public run() {
        const result: Result = {};
        const [lowerBoundery, upperBoundery] = this.getInputAsRows('-').map(val => parseInt(val, 10));

        this.timed('Part A', () => {
            let validKeys = 0;
            for(let key = lowerBoundery; key <= upperBoundery; key++) {
                if (this.isValid('' + key)) { validKeys++; }
            }
            result.a = validKeys;
        });
        this.timed('Part B', () => {
            let validKeys = 0;
            for(let key = lowerBoundery; key <= upperBoundery; key++) {
                if (this.isValid('' + key, true)) {
                    validKeys++;
                }
            }
            result.b = validKeys;
        });

        return result;
    }

    private isValid(input: string, extendedCheck?: boolean): boolean {
        if (extendedCheck) {
            const regex = /(\d)\1(?!\1)/g;
            let hasValid = false;
            let match;
            do {
                match = regex.exec(input);
                if (match) {
                    if(match[1] !== input[match.index - 1]) {
                        hasValid = true;
                    }
                    regex.lastIndex = match.index + 1;
                }
            } while (match && !hasValid);
            if (!hasValid) { return false; }
        } else {
            if (!input.match(/(\d)\1/)) { return false; }
        }

        let nums = input.split('').map(n => parseInt(n));
        for (let i = 1; i < nums.length; i++) {
            if (nums[i - 1] > nums[i]) { return false; }
        }
        return true;
    }
}

Runner(PuzzleSolution);