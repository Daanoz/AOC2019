import {PuzzleSolution} from './index';

describe('Puzzle 05', () => {
    let solution: PuzzleSolution;
    beforeEach(() => {
        solution = new PuzzleSolution();
    });
    describe('part A', () => {
        test('it should be able to handle immediate values', () => {
            solution.setInput('1002,7,4,7,4,7,99,33');
            expect(solution.run().a).toBe(132);
        });
    });
    describe('part B', () => { /* cases covert in int-processor spec */ });
});