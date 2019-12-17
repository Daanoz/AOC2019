import { Puzzle, Runner, BasePuzzle, Result } from '../shared/';

class LLEntry {
    public next?: LLEntry;
    constructor(public val: number, public index: number) {

    }
}

export class PuzzleSolution extends BasePuzzle implements Puzzle {
    public args = {
        iterations : 100,
        runPartB: true
    };

    public run() {
        const result: Result = {};
        let input = this.getInputAsRows('').map(n => parseInt(n, 10));
        let messsageOffset = parseInt(input.slice(0, 7).join(''), 10);

        let partA = [...input];
        for(let c = 0; c < this.args.iterations; c++) {
            partA = this.runPhase(partA);
        }
        result.a = partA.slice(0, 8).join('');

        if (this.args.runPartB) {
            let partB = [];
            for (let i = 0; i < 10000; i++) {
                partB.push(...input);
            }
            if (messsageOffset < (partB.length / 2)) {
                throw 'My "hack" does not work on the message offset: ' + messsageOffset;
            }
            for(let c = 0; c < this.args.iterations; c++) {
                partB = this.sumDigitsInSecondHalf(partB, messsageOffset);
            }
            result.b = partB.slice(messsageOffset, messsageOffset+8).join('');
        }

        return result;
    }

    private sumDigitsInSecondHalf(input: number[], offset: number): number[] {
        // Hhacky, be fast calculation.... Running the real thing will takes days in JS
        // The first digit for each index is multiplied by 1, starting from the middle of the list, ALL
        // digits afterwards are also multiplied by 1. The digits before that are to be multiplied by 0,
        // so they are not relevant. From that point onwards every digit, the amount of zero's increases
        // by 1, so removing that digit from the sum
        const relevantDigits = input.slice(offset);
        let sum = relevantDigits.reduce((sum, i) => sum + i, 0);
        relevantDigits.forEach((digit, outputIndexOffset) => {
            input[offset + outputIndexOffset] = Math.abs(sum % 10);
            sum -= digit;
        });
        return input;
    }

    private runPhase(input: number[]): number[] {
        let pattern = [0, 1, 0, -1];
        let output: (number | undefined)[] = input.map(_ => undefined);
        for (let outputIndex = 0; outputIndex < input.length; outputIndex++) {
            let sum = 0;
            for (let inputIndex = 0; inputIndex < input.length; inputIndex++) {
                let patternIndex = Math.ceil((inputIndex + 2) / (outputIndex + 1)) - 1;
                let factor = pattern[patternIndex % pattern.length];
                sum += input[inputIndex] * factor;
            }
            output[outputIndex] = Math.abs(sum % 10);
        }
        return output as number[];
    }
}

Runner(PuzzleSolution);