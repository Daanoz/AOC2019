import { Puzzle, Runner, BasePuzzle, Result } from '../shared/';
import { IntCodeProcessor } from '../02/int-code-processor.class';

export class PuzzleSolution extends BasePuzzle implements Puzzle {

    public run() {
        const result: Result = {};

        const input: number[] = this.getInputAsRows(',').map(r => parseInt(r, 10));

        const processorAirco = new IntCodeProcessor(input);
        processorAirco.setInput([1]);
        processorAirco.execute();
        result.a = processorAirco.getOutput().filter(val => val !== 0)[0];

        const processorThermalRadiator = new IntCodeProcessor(input);
        processorThermalRadiator.setInput([5]);
        processorThermalRadiator.execute();
        result.b = processorThermalRadiator.getOutput().filter(val => val !== 0)[0];

        return result;
    }


}

Runner(PuzzleSolution);