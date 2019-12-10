import { Puzzle, Runner, BasePuzzle, Result } from '../shared/';

enum CellType {
    EMPTY = '.',
    START = 'o',
    HORIZONTAL = '-',
    VERTICAL = '|',
    CORNER = '+',
    CROSSING = 'X',
    JUNCTION = '#'
}

interface Cell {
    wire?: number,
    length?: number,
    value: CellType
}

class Grid {
    public minX = 0;
    public maxX = 0;
    public minY = 0;
    public maxY = 0;

    public rowsAndCols: Map<number, Map<number, Cell>> = new Map([[0, new Map([[0, {
        value: CellType.EMPTY
    }]])]]);

    private crossings: {x: number, y: number, combinedLength: number}[] = [];

    constructor() {
        this.setCell(0, 0, {value: CellType.START});
    }

    public drawLine(from: [number, number], to: [number, number], wire: number, type: CellType, wireLength: number) {
        for(let y = from[1]; y !== to[1]; y += from[1] < to[1] ? 1 : -1) {
            if (y != from[1]) {
                wireLength++;
                this.setCell(from[0], y, {wire, value: type, length: wireLength});
            }
        }
        for(let x = from[0]; x !== to[0]; x += from[0] < to[0] ? 1 : -1) {
            if (x != from[0]) {
                wireLength++;
                this.setCell(x, from[1], {wire, value: type, length: wireLength});
            }
        }
        this.setCell(to[0], to[1], {wire, value: CellType.CORNER, length: wireLength});
    }

    public print() {
        let body = '\n';
        body += '.'.repeat((this.maxX - this.minX) + 3) + '\n';
        for(let y = this.maxY; y >= this.minY; y--) {
            let rowLine = '.';
            for(let x = this.minX; x <= this.maxX; x++) {
                const cell = this.getCell(x, y);
                rowLine += !cell.wire || cell.wire < 0 ? ' ' : cell.wire;
            }
            rowLine += '.';
            body += rowLine + '\n';
        }
        body += '.'.repeat((this.maxX - this.minX) + 3) + '\n';
        console.log(body);
    }

    public locateCrossingWithShortestPath(): number {
        let shortest = Number.MAX_VALUE;
        this.crossings.forEach(crossing => {
            shortest = Math.min(crossing.combinedLength, shortest);
        });
        return shortest;
    }

    public locateClosestCrossing(x: number, y: number): number {
        let shortest = Number.MAX_VALUE;
        this.crossings.forEach(crossing => {
            let distance = this.distance(x, y, crossing.x, crossing.y);
            shortest = Math.min(distance, shortest);
        });
        return shortest;
    }

    private distance(x: number, y: number, x2: number, y2: number){
        return Math.abs(x - x2) + Math.abs(y - y2);
    }

    private getCell(x: number, y: number): Cell {
        const row = this.rowsAndCols.get(y);
        if (!row) { return {wire: -1, value: CellType.EMPTY}; }
        return (row.get(x) as Cell) || {wire: -1, value: CellType.EMPTY};
    }

    private setCell(x: number, y: number, value: Cell) {
        this.minX = Math.min(x, this.minX);
        this.maxX = Math.max(x, this.maxX);
        this.minY = Math.min(y, this.minY);
        this.maxY = Math.max(y, this.maxY);

        let row = this.rowsAndCols.get(y);
        if (!row) {
            row = new Map();
            this.rowsAndCols.set(y, row);
        }
        const current = row.get(x) || {value: CellType.EMPTY};
        if (current.value === CellType.EMPTY) {
            row.set(x, value);
        }
        else if (
            current.value === CellType.CORNER ||
            current.value === CellType.HORIZONTAL ||
            current.value === CellType.VERTICAL
        ) {
            if (current.wire != value.wire) {
                row.set(x, {wire: -1, value: CellType.CROSSING});
                this.crossings.push({
                    x, y, combinedLength: (current.length || 0) + (value.length || 0)
                });
            } else {
                row.set(x, {...current, value: CellType.JUNCTION});
            }
        }
        else {
            console.error('Found unexpected: ', current, ' at ', x, y);
        }
    }
}

export class PuzzleSolution extends BasePuzzle implements Puzzle {
    public run() {
        const result: Result = {};
        const input: string[][] = this.getInputAsTable();

        const grid = new Grid();

        this.timed("Generate paths", () =>
            input.forEach((path, index) => this.drawLineOnGrid(grid, index, path)));

        grid.print();

        this.timed("Part A", () =>
            result.a = grid.locateClosestCrossing(0, 0));
        this.timed("Part B", () =>
            result.b = grid.locateCrossingWithShortestPath());

        return result;
    }

    private drawLineOnGrid(grid: Grid, wire: number, path: string[]): void {
        let currentPos: [number, number] = [0, 0];
        let wireLength = 0;
        path.forEach(item => {
            let direction = item.substr(0, 1);
            let length = parseInt(item.substr(1), 10);
            let type = ['U', 'D'].indexOf(direction) >= 0 ? CellType.VERTICAL : CellType.HORIZONTAL;
            let newPos: [number, number];
            switch (direction) {
                case 'U': { newPos = [currentPos[0], currentPos[1] + length]; } break;
                case 'D': { newPos = [currentPos[0], currentPos[1] - length];  } break;
                case 'L': { newPos = [currentPos[0] - length, currentPos[1]];  } break;
                case 'R': { newPos = [currentPos[0] + length, currentPos[1]];  } break;
                default: { throw 'Unkown direction: ' + direction; }
            }
            grid.drawLine(currentPos, newPos, wire, type, wireLength);
            currentPos = newPos;
            wireLength += length;
        });
    }
}

Runner(PuzzleSolution);