import {PuzzleSolution} from './index';

describe('Puzzle 03', () => {
    let solution: PuzzleSolution;
    beforeEach(() => {
        solution = new PuzzleSolution();
    });
    describe('part A', () => {
        test('it should be able to calculate the neareast crossing (example 1)', () => {
            solution.setInput('R8,U5,L5,D3\nU7,R6,D4,L4');
            expect(solution.run().a).toBe(6);
        });
        test.only('it should be able to calculate the neareast crossing (example 2)', () => {
            solution.setInput('R75,D30,R83,U83,L12,D49,R71,U7,L72\nU62,R66,U55,R34,D71,R55,D58,R83');
            expect(solution.run().a).toBe(159);
        });
        test('it should be able to calculate the neareast crossing (example 3)', () => {
            solution.setInput('R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51\nU98,R91,D20,R16,D67,R40,U7,R15,U6,R7');
            expect(solution.run().a).toBe(135);
        });
    });
    describe('part B', () => {
        test('it should be able to calculate the shortest wire crossing (example 1)', () => {
            solution.setInput('R8,U5,L5,D3\nU7,R6,D4,L4');
            expect(solution.run().b).toBe(30);
        });
        test('it should be able to calculate the shortest wire crossing (example 2)', () => {
            solution.setInput('R75,D30,R83,U83,L12,D49,R71,U7,L72\nU62,R66,U55,R34,D71,R55,D58,R83');
            expect(solution.run().b).toBe(610);
        });
        test('it should be able to calculate the shortest wire crossing (example 3)', () => {
            solution.setInput('R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51\nU98,R91,D20,R16,D67,R40,U7,R15,U6,R7');
            expect(solution.run().b).toBe(410);
        });
    });
});