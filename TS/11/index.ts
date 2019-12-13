import { Puzzle, Runner, BasePuzzle, Result } from '../shared/';
import { IntCodeProcessor } from '../02/int-code-processor.class';

enum CellType {
    BLACK = ' ',
    WHITE = '█'
}

class HullPrinter {
    private proc: IntCodeProcessor;
    private grid: Map<number, Map<number, CellType>> = new Map();

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
        return Array.from(this.grid.keys()).reduce((totalSum, y) =>
            totalSum + Array.from(this.grid.get(y)!.values()).length
        , 0);
    }

    private getCell(x: number, y: number): CellType {
        if (!this.grid.has(y)) { return CellType.BLACK; }
        if (!this.grid.get(y)!.has(x)) { return CellType.BLACK; }
        return this.grid.get(y)!.get(x)!
    }
    public setCell(x: number, y: number, value: CellType) {
        if (!this.grid.has(y)) { this.grid.set(y, new Map()); }
        this.grid.get(y)!.set(x, value)
    }

    public print(): string {
        let rowKeys = Array.from(this.grid.keys());
        let minX = 0;
        let maxX = 0;
        rowKeys.forEach(y => {
            minX = Math.min(minX, ...Array.from(this.grid.get(y)!.keys()));
            maxX = Math.max(maxX, ...Array.from(this.grid.get(y)!.keys()));
        });

        let body = '';
        for (let y = Math.max(...rowKeys); y >= Math.min(...rowKeys); y--) {
            let row = '';
            let gridRow = this.grid.get(y)!;
            for (let x = minX; x <= maxX; x++) {
                row += gridRow.has(x) ? gridRow.get(x)! : CellType.BLACK
            }
            body += row + '\n';
        }
        return body;
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