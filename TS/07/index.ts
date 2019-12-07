import { Puzzle, Runner, BasePuzzle, Result } from '../shared/';
import { IntCodeProcessor } from '../02/int-code-processor.class';

export class PuzzleSolution extends BasePuzzle implements Puzzle {
    private program: number[] = [];

    public run() {
        const result: Result = {};
        this.program = this.getInputAsRows(',').map(r => parseInt(r, 10));

        const possiblePhaseSettingsForA: number[][] = this.timed('GeneratePhaseSettings', () =>
            this.generateUniqueCombinations([0, 1, 2, 3, 4])
        );
        const possiblePhaseSettingsForB: number[][] = this.timed('GeneratePhaseSettings', () =>
            this.generateUniqueCombinations([5, 6, 7, 8, 9])
        );

        result.a = this.timed<number>('Part A', () =>
            this.findHighestSignalOutput(possiblePhaseSettingsForA)
        );
        result.b = this.timed<number>('Part B', () =>
            this.findHighestSignalOutputWithFeedbackLoop(possiblePhaseSettingsForB)
        );

        return result;
    }

    private findHighestSignalOutput(possiblePhaseSettings: number[][]): number {
        let highestSignal = 0;
        possiblePhaseSettings.forEach(phaseSetting => {
            let input = 0;
            phaseSetting.forEach(amplifierSetting => {
                const processor = new IntCodeProcessor(this.program);
                processor.setInput([amplifierSetting, input]);
                processor.execute(true);
                input = processor.getOutput()[0];
            });
            highestSignal = Math.max(highestSignal, input);
        });
        return highestSignal;
    }

    private findHighestSignalOutputWithFeedbackLoop(possiblePhaseSettings: number[][]): number {
        let highestSignal = 0;
        possiblePhaseSettings.forEach(phaseSetting => {

            let processors: IntCodeProcessor[] = phaseSetting.map(amplifierSetting => {
                const proc = new IntCodeProcessor(this.program);
                proc.setInput([amplifierSetting]);
                return proc;
            });

            let hasExited = false;
            let input = 0;
            while(!hasExited) {
                processors.every(processor => {
                    processor.appendInput(input);
                    processor.execute(true);
                    if (processor.getHasExited()) {
                        hasExited = true;
                        return false;
                    }
                    input = processor.getOutput()[0];
                    return true;
                });
            }
            highestSignal = Math.max(highestSignal, input);
        });

        return highestSignal;
    }

    private generateUniqueCombinations(inputs: number[]): number[][] {
        let result: number[][] = [];
        if (inputs.length === 1) { return [inputs]; }
        for (let i = 0; i < inputs.length; i++) {
            const val = inputs[i];
            this.generateUniqueCombinations(
                inputs.slice(0, i).concat(inputs.slice(i + 1, inputs.length))
            ).forEach(subCombination => {
                result.push([val, ...subCombination]);
            })
        }
        return result;
    }

}

Runner(PuzzleSolution);