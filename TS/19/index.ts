import { Puzzle, Runner, BasePuzzle, Result, EndlessGrid } from '../shared/';
import { IntCodeProcessor } from '../02/int-code-processor.class';

export class PuzzleSolution extends BasePuzzle implements Puzzle {
    private grid: EndlessGrid<string> = new EndlessGrid();
    private program: number[] = [];
    private completedRows: number[] = [];

    public run() {
        const result: Result = {};
        this.program = this.getInputAsRows(',').map(r => parseInt(r, 10));

        for(let r = 0; r < 50; r++) {
            this.sendDroneToRow(r);
        }

        result.a = this.grid.countBy(cell => cell === '#');

        let shipPosition = this.binarySearchPosition(100);
        result.b = (shipPosition[0] * 10000) + shipPosition[1];

        return result;
    }

    private binarySearchPosition(size: number): [number, number] {
        let shipPosition;
        let row = size * 10;
        let delta = 512;
        while (!shipPosition) {
            this.sendDroneToRow(row);
            let pos = this.getShipPos(row, size);
            if (!pos) {
                row += delta;
            } else {
                row -= delta;
                delta /= 2;
                if(delta < 1) {
                    shipPosition = pos;
                }
            }
        }
        return shipPosition;
    }

    private getShipPos(index: number, size: number): [number, number] | undefined {
        let startX = this.grid.getRow(index).indexOf('#');
        const box = [startX, index - (size - 1), startX + (size - 1), index];
        box.forEach(index => this.sendDroneToRow(index));
        if (this.grid.get(box[0], box[1]) !== '#') { return undefined; }
        if (this.grid.get(box[2], box[1]) !== '#') { return undefined; }
        if (this.grid.get(box[2], box[3]) !== '#') { return undefined; }
        return [box[0], box[1]];
    }

    private sendDroneToRow(row: number) {
        if (this.completedRows.indexOf(row) >= 0) { return; }
        for(let x = 0; x < row; x++) { this.sendDrone(x, row); }
        for(let y = 0; y <= row; y++) { this.sendDrone(row, y); }
        this.completedRows.push(row);
    }

    private sendDrone(x: number, y: number) {
        const proc = new IntCodeProcessor(this.program);
        proc.setInput([x, y]);
        proc.execute(true);
        this.grid.set(x, y, proc.getLastOutput() === 1 ? '#' : '.')
    }
}

Runner(PuzzleSolution);