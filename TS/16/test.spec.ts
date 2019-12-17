import {PuzzleSolution} from './index';

describe('Puzzle 16', () => {
    let solution: PuzzleSolution;
    beforeEach(() => {
        solution = new PuzzleSolution();
    });
    describe('part A', () => {
        test('12345678', () => {
            solution.setInput('12345678');
            solution.args.iterations = 4;
            solution.args.runPartB = false;
            expect(solution.run().a).toBe('01029498');
        });
        test('80871224585914546619083218645595', () => {
            solution.setInput('80871224585914546619083218645595');
            solution.args.runPartB = false;
            expect(solution.run().a).toBe('24176176');
        });
        test('19617804207202209144916044189917', () => {
            solution.setInput('19617804207202209144916044189917');
            solution.args.runPartB = false;
            expect(solution.run().a).toBe('73745418');
        });
        test('69317163492948606335995924319873', () => {
            solution.setInput('69317163492948606335995924319873');
            solution.args.runPartB = false;
            expect(solution.run().a).toBe('52432133');
        });
    });
    describe('part B', () => {
    });
});