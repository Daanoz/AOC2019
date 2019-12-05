import { Puzzle, Runner, BasePuzzle, Result } from '../shared/';

export class PuzzleSolution extends BasePuzzle implements Puzzle {
    public run() {
        const result: Result = {};

        return result;
    }

}

Runner(PuzzleSolution);