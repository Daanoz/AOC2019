import {PuzzleSolution} from './index';

describe('Puzzle 06', () => {
    let solution: PuzzleSolution;
    beforeEach(() => {
        solution = new PuzzleSolution();
    });
    describe('part A', () => {
        test('should return the right checksum', () => {
            solution.setInput(['COM)B','B)C','C)D','D)E','E)F','B)G','G)H','D)I','E)J','J)K','K)L'].join('\n'));
            expect(solution.run().a).toBe(42);
        });
    });
    describe('part B', () => {
        test('should return the right amount of hops', () => {
            solution.setInput(['COM)B','B)C','C)D','D)E','E)F','B)G', 'G)H','D)I','E)J','J)K','K)L','K)YOU','I)SAN'].join('\n'));
            expect(solution.run().b).toBe(4);
        });
    });
});