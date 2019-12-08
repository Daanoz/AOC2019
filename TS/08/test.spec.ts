import {PuzzleSolution, Image} from './index';

describe('Puzzle 08', () => {
    let solution: PuzzleSolution;
    beforeEach(() => {
        solution = new PuzzleSolution();
    });
    describe('part A', () => {
        test('should work with an example validation', () => {
            const img = new Image(3, 2);
            img.load('123456789012');
            expect(img.findChecksum()).toBe(1);
        });
        test('should work with an example validation with more 1s', () => {
            const img = new Image(3, 2);
            img.load('123111789012');
            expect(img.findChecksum()).toBe(4);
        });
    });
    describe('part B', () => {
        test('should produce the correct image', () => {
            const img = new Image(2, 2);
            img.load('0222112222120000');
            expect(img.render()).toBe(' █\n█ \n');
        });
    });
});