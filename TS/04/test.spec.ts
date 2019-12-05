import {PuzzleSolution} from './index';

describe('Puzzle 04', () => {
    let solution: PuzzleSolution;
    const isValidForA = (number: number) => {
        solution.setInput(number + '-' + number);
        return solution.run().a === 1;
    };
    const isValidForB = (number: number) => {
        solution.setInput(number + '-' + number);
        return solution.run().b === 1;
    };
    beforeEach(() => {
        solution = new PuzzleSolution();
    });
    describe('part A', () => {
        test('111111 to match', () => {
            expect(isValidForA(111111)).toBe(true);
        });
        test('223450 to not match', () => {
            expect(isValidForA(223450)).toBe(false);
        });
        test('123789 to not match', () => {
            expect(isValidForA(123789)).toBe(false);
        });
    });
    describe('part B', () => {
        test('112233 to match', () => {
            expect(isValidForB(112233)).toBe(true);
        });
        test('123444 to not match', () => {
            expect(isValidForB(123444)).toBe(false);
        });
        test('111122 to match', () => {
            expect(isValidForB(111122)).toBe(true);
        });
        test('699999 to not match', () => {
            expect(isValidForB(699999)).toBe(false);
        });
    });
});