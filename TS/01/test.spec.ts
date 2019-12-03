import {PuzzleSolution} from './index';

describe('Puzzle 01', () => {
    let solution: PuzzleSolution;
    beforeEach(() => {
        solution = new PuzzleSolution();
    });
    describe('part A', () => {
        test('it should be able to calculate the fuel for a mass of 12', () => {
            solution.setInput('12');
            expect(solution.run().a).toBe(2);
        });
        test('it should be able to calculate the fuel for a mass of 14', () => {
            solution.setInput('14');
            expect(solution.run().a).toBe(2);
        });
        test('it should be able to calculate the fuel for a mass of 1969', () => {
            solution.setInput('1969');
            expect(solution.run().a).toBe(654);
        });
        test('it should be able to calculate the fuel for a mass of 100756', () => {
            solution.setInput('100756');
            expect(solution.run().a).toBe(33583);
        });
    });
    describe('part B', () => {
        test('it should be able to calculate the total fuel for a mass of 14', () => {
            solution.setInput('14');
            expect(solution.run().b).toBe(2);
        });
        test('it should be able to calculate the total fuel for a mass of 1969', () => {
            solution.setInput('1969');
            expect(solution.run().b).toBe(966);
        });
        test('it should be able to calculate the total fuel for a mass of 100756', () => {
            solution.setInput('100756');
            expect(solution.run().b).toBe(50346);
        });
    });
});