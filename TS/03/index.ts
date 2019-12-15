import { Puzzle, Runner, BasePuzzle, Result, EndlessGrid, GridCell } from '../shared/';

enum CellType {
    EMPTY = '.',
    START = 'o',
    HORIZONTAL = '-',
    VERTICAL = '|',
    CORNER = '+',
    CROSSING = 'X',
    JUNCTION = '#'
}

class Cell implements GridCell {
    public wire?: number;
    public length?: number;
    constructor(public value: CellType, opts?: {wire?: number, length?: number}) {
        if (opts && opts.wire) { this.wire = opts.wire; }
        if (opts && opts.length) { this.length = opts.length; }
    }
    public toString() {
        return this.value;
    }
}

class Grid {
    private grid: EndlessGrid<Cell> = new EndlessGrid();
    private crossings: {x: number, y: number, combinedLength: number}[] = [];

    constructor() {
        this.setCell(0, 0, new Cell(CellType.START));
    }

    public drawLine(from: [number, number], to: [number, number], wire: number, type: CellType, wireLength: number) {
        for(let y = from[1]; y !== to[1]; y += from[1] < to[1] ? 1 : -1) {
            if (y != from[1]) {
                wireLength++;
                this.setCell(from[0], y, new Cell(type, {wire, length: wireLength}));
            }
        }
        for(let x = from[0]; x !== to[0]; x += from[0] < to[0] ? 1 : -1) {
            if (x != from[0]) {
                wireLength++;
                this.setCell(x, from[1], new Cell(type, {wire, length: wireLength}));
            }
        }
        this.setCell(to[0], to[1], new Cell(CellType.CORNER, {wire, length: wireLength}));
    }

    public print() {
        console.log(this.grid.toString());
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
        return this.grid.get(x, y, new Cell(CellType.EMPTY))!;
    }

    private setCell(x: number, y: number, value: Cell) {
        const current = this.getCell(x, y);
        if (current.value === CellType.EMPTY) {
            this.grid.set(x, y, value);
        } else if (
            current.value === CellType.CORNER ||
            current.value === CellType.HORIZONTAL ||
            current.value === CellType.VERTICAL
        ) {
            if (current.wire != value.wire) {
                this.grid.set(x, y, new Cell(CellType.CROSSING, {wire: -1}));
                this.crossings.push({
                    x, y, combinedLength: (current.length || 0) + (value.length || 0)
                });
            } else {
                this.grid.set(x, y, new Cell(CellType.JUNCTION, {wire: current.wire, length: current.length}));
            }
        } else {
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