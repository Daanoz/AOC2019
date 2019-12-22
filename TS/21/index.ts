import { Puzzle, Runner, BasePuzzle, Result } from '../shared/';
import { IntCodeProcessor } from '../02/int-code-processor.class';

export class PuzzleSolution extends BasePuzzle implements Puzzle {
    private program: number[] = [];
    private proc?: IntCodeProcessor;
    public run() {
        const result: Result = {};
        this.program = this.getInputAsRows(',').map(r => parseInt(r, 10));
        result.a = this.runA();
        result.b = this.runB();

        return result;
    }

    private runA() {
        this.proc = new IntCodeProcessor(this.program);
        this.proc.execute(false, true);
        this.printOutput();

        const springProgram = [
            'NOT A J',
            'NOT B T',
            'OR T J',
            'NOT C T',
            'OR T J',
            'AND D J',
        ];
        this.writeProgram(springProgram.concat('WALK').join('\n') + '\n');
        this.proc.execute(false, true);
        this.printOutput();
        return this.proc.getLastOutput();
    }

    private runB() {
        this.proc = new IntCodeProcessor(this.program);
        this.proc.execute(false, true);
        this.printOutput();

        const springProgram = [
            'OR A T',
            'AND B T',
            'AND C T',
            'NOT T J', // There is a hole in the next 3
            'AND D J', // There is a floor where can be landed
            'NOT J T', // 'set' T to false
            'OR E T',
            'OR H T',
            'AND T J' // only jump when when E (to start new jump instruction) or H (double jump) are a floor
        ];
        this.writeProgram(springProgram.concat('RUN').join('\n') + '\n');
        this.proc.execute(false, true);
        this.printOutput();
        return this.proc.getLastOutput();
    }

    private writeProgram(program: string) {
        if (program.split('\n').length - 2 > 15) {
            console.log('WARNING; instructions are exceeding 15: ' + (program.split('\n').length - 2));
        }
        this.proc!.setInput(
            program.split('').map(char => char.charCodeAt(0))
        )
    }

    private printOutput() {
        let str = this.proc!.getOutput().map(code => code > 200 ? code : String.fromCharCode(code)).join('');
        console.log(str);
    }
}

Runner(PuzzleSolution);