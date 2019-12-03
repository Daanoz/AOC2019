import {PuzzleSolution} from './index';

describe('Puzzle 02', () => {
    let solution: PuzzleSolution;
    beforeEach(() => {
        solution = new PuzzleSolution();
    });
    describe('part A', () => {
        test('it should be able to calculate the output of 1,0,0,0,99', () => {
            solution.setInput('1,0,0,0,99');
            solution.args.noun = 0; // unset defaults
            solution.args.verb = 0;
            expect(solution.run().a).toBe(2);
        });
        test('it should be able to calculate the output of 2,3,0,3,99', () => {
            solution.setInput('2,3,0,3,99');
            solution.args.noun = 3; // unset defaults
            solution.args.verb = 0;
            solution.args.position = 3;
            expect(solution.run().a).toBe(6);
        });
        test('it should be able to calculate the output of 2,4,4,5,99,9801', () => {
            solution.setInput('2,4,4,5,99,9801');
            solution.args.noun = 4; // unset defaults
            solution.args.verb = 4;
            solution.args.position = 5;
            expect(solution.run().a).toBe(9801);
        });
        test('it should be able to calculate the output of 1,1,1,4,99,5,6,0,99', () => {
            solution.setInput('1,1,1,4,99,5,6,0,99');
            solution.args.noun = 1; // unset defaults
            solution.args.verb = 1;
            expect(solution.run().a).toBe(30);
        });
    });
    describe('part B', () => {
    });
});