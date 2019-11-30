import { Puzzle, Runner, BasePuzzle } from '../shared/';

class PuzzleSolution extends BasePuzzle implements Puzzle {
    public run() {
        console.log('HELLO WORLD 2345', this.getInput())
    }
}

Runner(PuzzleSolution);