import {PuzzleSolution} from './index';
import fs from 'fs';
import path from 'path';

describe('Puzzle 22', () => {
    let solution: PuzzleSolution;
    beforeEach(() => {
        solution = new PuzzleSolution();
    });
    describe('part A', () => {
        beforeEach(() => {
            solution.args = {
                deckSizePartA: 10,
                cardToFindPartA: 1,

                deckSizePartB: 10,
                iterationsPartB: 1,
                cardToFindPartB: 1
            }
        });
        test('deal into new stack', () => {
            solution.setInput(
`deal into new stack`
            );
            const result = solution.run();
            expect(result.meta.cards).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
            expect(result.a).toEqual(8);
        });
        test('cut 3', () => {
            solution.setInput(
`cut 3`
            );
            const result = solution.run();
            expect(result.meta.cards).toEqual([3, 4, 5, 6, 7, 8, 9, 0, 1, 2]);
            expect(result.a).toEqual(8);
        });
        test('cut -4', () => {
            solution.setInput(
`cut -4`
            );
            const result = solution.run();
            expect(result.meta.cards).toEqual([6, 7, 8, 9, 0, 1, 2, 3, 4, 5]);
            expect(result.a).toEqual(5);
        });
        test('deal with increment 3', () => {
            solution.setInput(
`deal with increment 3`
            );
            const result = solution.run();
            expect(result.meta.cards).toEqual([0, 7, 4, 1, 8, 5, 2, 9, 6, 3]);
            expect(result.a).toEqual(3);
        });
        test('example1', () => {
            solution.setInput(
`deal with increment 7
deal into new stack
deal into new stack`
            );
            const result = solution.run();
            expect(result.meta.cards).toEqual([0, 3, 6, 9, 2, 5, 8, 1, 4, 7]);
            expect(result.a).toEqual(7);
        });
        test('example2', () => {
            solution.setInput(
`cut 6
deal with increment 7
deal into new stack`
            );
            const result = solution.run();
            expect(result.meta.cards).toEqual([3, 0, 7, 4, 1, 8, 5, 2, 9, 6]);
            expect(result.a).toEqual(4);
        });
        test('example3', () => {
            solution.setInput(
`deal with increment 7
deal with increment 9
cut -2`
            );
            const result = solution.run();
            expect(result.meta.cards).toEqual([6, 3, 0, 7, 4, 1, 8, 5, 2, 9]);
            expect(result.a).toEqual(5);
        });
        test('example4', () => {
            solution.setInput(
`deal into new stack
cut -2
deal with increment 7
cut 8
cut -4
deal with increment 7
cut 3
deal with increment 9
deal with increment 3
cut -1`
            );
            const result = solution.run();
            expect(result.meta.cards).toEqual([9, 2, 5, 8, 1, 4, 7, 0, 3, 6]);
            expect(result.a).toEqual(4);
        });
    });
    describe('part B', () => {
        beforeEach(() => {
            solution.args = {
                deckSizePartA: 10,
                cardToFindPartA: 1,

                deckSizePartB: 53, // has to be prime
                iterationsPartB: 23, // has to be prime
                cardToFindPartB: 1
            }
        });
        test('deal into new stack', () => {
            solution.setInput(
`deal into new stack`
            );
            const result = solution.run();
            expect(result.b).toEqual(51);
        });
        test('cut 3', () => {
            solution.setInput(
`cut 3`
            );
            const result = solution.run();
            expect(result.b).toEqual(1);
        });
        test('cut -4', () => {
            solution.setInput(
`cut -4`
            );
            const result = solution.run();
            expect(result.b).toEqual(1);
        });
        test('deal with increment 3', () => {
            solution.setInput(
`deal with increment 3`
            );
            const result = solution.run();
            expect(result.b).toEqual(26);
        });
        test('example1', () => {
            solution.setInput(
`deal with increment 7
deal into new stack
deal into new stack`
            );
            const result = solution.run();
            expect(result.b).toEqual(25);
        });
        test('example2', () => {
            solution.setInput(
`cut 6
deal with increment 7
deal into new stack`
            );
            const result = solution.run();
            expect(result.b).toEqual(42);
        });
        test('example3', () => {
            solution.setInput(
`deal with increment 7
deal with increment 9
cut -2`
            );
            const result = solution.run();
            expect(result.b).toEqual(3);
        });
        test('example4', () => {
            solution.setInput(
`deal into new stack
cut -2
deal with increment 7
cut 8
cut -4
deal with increment 7
cut 3
deal with increment 9
deal with increment 3
cut -1`
            );
            const result = solution.run();
            expect(result.b).toEqual(8);
        });
        test('real input, less cycles', () => {
            solution.args.deckSizePartB = 10007;
             solution.setInput(fs.readFileSync(path.join(__dirname, 'input'), {encoding: 'utf-8'}));
            const result = solution.run();
            expect(result.b).toEqual(1209);
        });
    });
});