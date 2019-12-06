import {IntCodeProcessor} from './int-code-processor.class';

describe('IntCodeProcessor', () => {
    test('it should be able to calculate the output of 1,0,0,0,99', () => {
        const processor = new IntCodeProcessor([1,0,0,0,99]);
        processor.execute();
        expect(processor.readPosition(0)).toBe(2);
    });
    test('it should be able to calculate the output of 2,3,0,3,99', () => {
        const processor = new IntCodeProcessor([2,3,0,3,99]);
        processor.execute();
        expect(processor.readPosition(3)).toBe(6);
    });
    test('it should be able to calculate the output of 2,4,4,5,99,9801', () => {
        const processor = new IntCodeProcessor([2,4,4,5,99,9801]);
        processor.execute();
        expect(processor.readPosition(5)).toBe(9801);
    });
    test('it should be able to calculate the output of 1,1,1,4,99,5,6,0,99', () => {
        const processor = new IntCodeProcessor([1,1,1,4,99,5,6,0,99]);
        processor.execute();
        expect(processor.readPosition(0)).toBe(30);
    });
    test('it should be able to calculate the output of 3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9', () => {
        const processor1 = new IntCodeProcessor([3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9]);
        processor1.setInput([0]);
        processor1.execute();
        expect(processor1.getOutput()).toEqual([0]);
        const processor2 = new IntCodeProcessor([3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9]);
        processor2.setInput([3]);
        processor2.execute();
        expect(processor2.getOutput()).toEqual([1]);
    });
    test('it should be able to calculate the output of 3,3,1105,-1,9,1101,0,0,12,4,12,99,1', () => {
        const processor1 = new IntCodeProcessor([3,3,1105,-1,9,1101,0,0,12,4,12,99,1]);
        processor1.setInput([0]);
        processor1.execute();
        expect(processor1.getOutput()).toEqual([0]);
        const processor2 = new IntCodeProcessor([3,3,1105,-1,9,1101,0,0,12,4,12,99,1]);
        processor2.setInput([3]);
        processor2.execute();
        expect(processor2.getOutput()).toEqual([1]);
    });
});