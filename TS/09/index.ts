import { Puzzle, Runner, BasePuzzle, Result } from '../shared/';
import { IntCodeProcessor } from '../02/int-code-processor.class';

export class PuzzleSolution extends BasePuzzle implements Puzzle {
    private program: number[] = [];

    public run() {
        const result: Result = {};
        this.program = this.getInputAsRows(',').map(r => parseInt(r, 10));

        const proc = new IntCodeProcessor(this.program);
        proc.setInput([1]);
        proc.execute();
        result.a = proc.getOutput()[0];

        const procB = new IntCodeProcessor(this.program);
        procB.setInput([2]);
        procB.execute();
        result.b = procB.getOutput()[0];

        return result;
    }

}

Runner(PuzzleSolution);