import { Puzzle, Runner, BasePuzzle, Result, EndlessGrid } from '../shared/';
import { IntCodeProcessor } from '../02/int-code-processor.class';

enum CellType {
    BLACK = ' ',
    WHITE = '█'
}

class HullPrinter {
    private proc: IntCodeProcessor;
    private grid: EndlessGrid<CellType> = new EndlessGrid();

    private position = [0, 0];
    private direction = 0;

    constructor(program: number[]) {
        this.proc = new IntCodeProcessor(program);
    }

    public go() {
        while (!this.proc.getHasExited()) {
            this.proc.appendInput(this.getCell(this.position[0], this.position[1]) === CellType.BLACK ? 0 : 1);
            this.proc.execute(true);
            let outputColor = this.proc.getLastOutput();
            this.proc.execute(true);
            let newDirection = this.proc.getLastOutput();
            this.setCell(this.position[0], this.position[1], outputColor === 1 ? CellType.WHITE : CellType.BLACK);
            this.direction = (this.direction + (newDirection === 0 ? 3 : 1)) % 4;

            switch(this.direction) {
                case 0: /* UP    */ this.position = [this.position[0], this.position[1] + 1]; break;
                case 1: /* RIGHT */ this.position = [this.position[0] + 1, this.position[1]]; break;
                case 2: /* DOWN  */ this.position = [this.position[0], this.position[1] - 1]; break;
                case 3: /* LEFT  */ this.position = [this.position[0] - 1, this.position[1]]; break;
            }
        }
    }

    public countCells(): number {
        return this.grid.count();
    }
    private getCell(x: number, y: number): CellType {
        return this.grid.get(x, y, CellType.BLACK)!;
    }
    public setCell(x: number, y: number, value: CellType) {
        return this.grid.set(x, y, value)!;
    }
    public print(): string {
        return this.grid.toString();
    }
}

export class PuzzleSolution extends BasePuzzle implements Puzzle {
    private program: number[] = [];

    public run() {
        const result: Result = {};
        this.program = this.getInputAsRows(',').map(r => parseInt(r, 10));
        const printer = new HullPrinter(this.program);
        printer.go();
        result.a = printer.countCells();
        console.log(printer.print());

        const printer2 = new HullPrinter(this.program);
        printer2.setCell(0, 0, CellType.WHITE);
        printer2.go();
        result.b = '\n' + printer2.print();

        return result;
    }

}

Runner(PuzzleSolution);