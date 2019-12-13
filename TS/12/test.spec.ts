import {PuzzleSolution} from './index';

describe('Puzzle TEMPLATE', () => {
    let solution: PuzzleSolution;
    beforeEach(() => {
        solution = new PuzzleSolution();
    });
    describe('part A', () => {
        test('sample 1', () => {
            solution.setInput("<x=-8, y=-10, z=0>\n<x=5, y=5, z=10>\n<x=2, y=-7, z=3>\n<x=9, y=-8, z=-3>")
            solution.args.steps = 100;
            const result = solution.run();
            expect(result.a).toBe(1940)
        });
        test('sample 2', () => {
            solution.setInput("<x=-1, y=0, z=2>\n<x=2, y=-10, z=-7>\n<x=4, y=-8, z=8>\n<x=3, y=5, z=-1>")
            solution.args.steps = 100;
            const result = solution.run();
            expect(result.a).toBe(293)
        });
    });
    describe('part B', () => {
        test.only('sample 1', () => {
            solution.setInput("<x=-1, y=0, z=2>\n<x=2, y=-10, z=-7>\n<x=4, y=-8, z=8>\n<x=3, y=5, z=-1>")
            const result = solution.run();
        });
    });
});