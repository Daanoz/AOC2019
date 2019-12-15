import { Puzzle, Runner, BasePuzzle, Result, EndlessGrid } from '../shared/';
import { IntCodeProcessor } from '../02/int-code-processor.class';

enum CellType {
    EMPTY = ' ',
    WALL = '█',
    TRACKED = '.',
    PATH = '#',
    DRONE = '@',
    HASOXYGEN = 'O'
}
enum Move {
    UP = 1,
    DOWN = 2,
    LEFT = 3,
    RIGHT = 4
}

export class PuzzleSolution extends BasePuzzle implements Puzzle {
    private static CounterMoves = {
        [Move.UP]: Move.DOWN,
        [Move.DOWN]: Move.UP,
        [Move.RIGHT]: Move.LEFT,
        [Move.LEFT]: Move.RIGHT
    };
    private grid: EndlessGrid<CellType> = new EndlessGrid();
    private program: number[] = [];
    private proc?: IntCodeProcessor;

    private currentPos: [number, number] = [0, 0];
    private finalPos?: [number, number];

    public run() {
        const result: Result = {};
        this.program = this.getInputAsRows(',').map(r => parseInt(r, 10));
        this.proc = new IntCodeProcessor(this.program);
        this.grid.set(0, 0, CellType.TRACKED);

        let path: {dir: Move, pos: number[]}[] = [];
        let pathToOxygen: {dir: Move, pos: number[]}[] = [];
        let completed = false;
        let index = 0;
        while(!completed && index < 2000) {
            index++;
            this.getCurrentSurroundings();
            let options = this.getMovementOptions();
            if (options.length > 0) {
                this.makeMove(options[0]);
                path.push({dir: options[0], pos: [...this.currentPos]});
                if (this.finalPos &&
                    this.finalPos[0] === this.currentPos[0] &&
                    this.finalPos[1] === this.currentPos[1]) {
                    pathToOxygen = [...path];
                }
            } else {
                while (path.length > 0 && this.getMovementOptions().length <= 0) {
                    this.makeMove(PuzzleSolution.CounterMoves[path.pop()!.dir]);
                }
                if (path.length < 1) {
                    completed = true;
                }
            }
        }
        pathToOxygen.forEach(p => {
            this.grid.set(p.pos[0], p.pos[1], CellType.PATH);
        });
        console.log(this.grid.toString());

        result.a = pathToOxygen.length;
        // 300 to low

        this.grid.set(this.finalPos![0], this.finalPos![1], CellType.HASOXYGEN);
        let oxygenCells: [number, number][] = [this.finalPos!];
        let mins = 0;
        let done = false;
        while (!done) {
            let nonOxyCells = this.getNonOxygenCells(oxygenCells);
            if (nonOxyCells.length < 1) {
                done = true;
            } else {
                mins++;
                nonOxyCells.forEach(c => this.grid.set(c[0], c[1], CellType.HASOXYGEN));
                oxygenCells = oxygenCells.concat(nonOxyCells);
            }
        }
        result.b = mins;

        return result;
    }

    private getNonOxygenCells(oxyCells: [number, number][]): [number, number][] {
        const nonOxyCells: [number, number][] = [];
        const nonOxyCellHashes: string[] = [];
        oxyCells.forEach(c => {
            [Move.UP, Move.DOWN, Move.LEFT, Move.RIGHT].forEach(dir => {
                const neighbourPos = this.applyDirToCoord(c, dir);
                const cellState = this.grid.get(neighbourPos[0], neighbourPos[1])!;
                if ([CellType.DRONE, CellType.PATH, CellType.TRACKED].indexOf(cellState) >= 0) {
                    let cellHash = neighbourPos[0] + '_' + neighbourPos[1];
                    if (nonOxyCellHashes.indexOf(cellHash) < 0) {
                        nonOxyCells.push(neighbourPos);
                        nonOxyCellHashes.push(cellHash);
                    }
                }
            });
        })
        return nonOxyCells;
    }

    private getMovementOptions() {
        return [Move.UP, Move.DOWN, Move.LEFT, Move.RIGHT].filter(dir => {
            let nextPos = this.applyDirToCoord(this.currentPos, dir);
            return this.grid.get(nextPos[0], nextPos[1]) === CellType.EMPTY;
        });
    }

    private getCurrentSurroundings() {
        let unknownDirs = [Move.UP, Move.DOWN, Move.LEFT, Move.RIGHT].filter(dir => {
            let nextPos = this.applyDirToCoord(this.currentPos, dir);
            return !this.grid.has(nextPos[0], nextPos[1])
        });
        unknownDirs.forEach(dir => {
            if (this.makeMove(dir, true)) {
                this.makeMove(PuzzleSolution.CounterMoves[dir], true);
            }
        })
    }

    private makeMove(dir: number, isNotTracking?: boolean): boolean {
        this.proc!.setInput([dir]);
        this.proc!.execute(true);
        let result = this.proc!.getLastOutput();
        let nextCoord = this.applyDirToCoord(this.currentPos, dir);
        if (result === 0) {
            this.grid.set(nextCoord[0], nextCoord[1], CellType.WALL);
            return false;
        }
        this.grid.set(this.currentPos[0], this.currentPos[1], isNotTracking ? CellType.EMPTY : CellType.TRACKED);
        this.grid.set(nextCoord[0], nextCoord[1], CellType.DRONE);
        this.currentPos = nextCoord;
        if (result === 2) {
            this.finalPos = nextCoord;
        }
        return true;
    }

    private applyDirToCoord(pos: [number, number], dir: number): [number, number] {
        switch(dir) {
            case Move.UP: return [pos[0], pos[1] + 1];
            case Move.DOWN: return [pos[0], pos[1] - 1];
            case Move.LEFT: return [pos[0] - 1, pos[1]];
            case Move.RIGHT: return [pos[0] + 1, pos[1]];
        }
        throw 'Unknown dir: ' + dir + ' @ ' + this.currentPos;
    }
}

Runner(PuzzleSolution);