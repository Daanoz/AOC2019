import { Puzzle, Runner, BasePuzzle } from '../shared/';
import { exec } from 'child_process';

class PuzzleSolution extends BasePuzzle implements Puzzle {
    public run() {
        const input: number[] = this.getInputAsRows(',').map(r => parseInt(r, 10));

        console.log("Part A: " + this.executeWithArgs(input, 12, 2));

        for (let noun = 0; noun <= 99; noun++) {
            for (let verb = 0; verb <= 99; verb++) {
                const result = this.executeWithArgs(input, noun, verb);
                if (result === 19690720) {
                    console.log("Part B: " + (100 * noun + verb), noun, verb);
                    noun = 100;
                    verb = 100;
                }
            }
        }
    }

    private executeWithArgs(instructions: number[], noun: number, verb: number): number {
        const input = [...instructions];
        input[1] = noun;
        input[2] = verb;
        return this.execute(input);
    }

    private execute(instructions: number[]): number {
        const input = [...instructions];
        let instructionPointer = 0;
        let isFinished = false;
        while (!isFinished) {
            const opCode = input[instructionPointer];
            const parameters = input.slice(instructionPointer + 1, instructionPointer + 4);
            switch(opCode) {
                case 1 : {
                    input[parameters[2]] = input[parameters[0]] + input[parameters[1]];
                } break;
                case 2 : {
                    input[parameters[2]] = input[parameters[0]] * input[parameters[1]];
                } break;
                case 99: { isFinished = true; } break;
                case undefined: {
                    console.error('Program failure');
                    isFinished = true;
                } break;
            }
            instructionPointer += 4;
        }
        return input[0];
    }
}

Runner(PuzzleSolution);