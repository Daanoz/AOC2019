import { Puzzle, Runner, BasePuzzle, Result, EndlessGrid } from '../shared/';
import { IntCodeProcessor } from '../02/int-code-processor.class';

enum Direction {
    UP = 0,
    RIGHT = 1,
    DOWN = 2,
    LEFT = 3
};

export class PuzzleSolution extends BasePuzzle implements Puzzle {
    private proc?: IntCodeProcessor;
    private program?: number[];
    private grid: EndlessGrid<string> = new EndlessGrid();
    private start?: [number, number];

    public run() {
        const result: Result = {};

        this.program = this.getInputAsRows(',').map(r => parseInt(r, 10));
        result.a = this.findPartA(this.program)
        result.b = this.findPartB(this.program);
        return result;
    }

    private findPartB(program: number[]): number {
        let path = [];
        let pos: [number, number] = [this.start![0], this.start![1]];
        let dir = Direction.UP;
        let nextDir;
        while ((nextDir = this.findDirectionFromPosition(pos, dir)) !== 0) {
            path.push(nextDir === -1 ? 'L' : 'R');
            dir = (dir + (4 + nextDir)) % 4;
            let move = this.moveUntillStop(pos, dir);
            pos = move.newPos;
            path.push(move.length);
        }

        let movementCode = this.divideAndSplitPath(path);

        let input = (movementCode + '\nn\n').split('').map(s => s.charCodeAt(0));
        let wakeProgram = [...program];
        wakeProgram[0] = 2;
        const proc: IntCodeProcessor = new IntCodeProcessor([...wakeProgram]);
        proc.setInput(input);

        const grid: EndlessGrid<string> = new EndlessGrid();
        this.buildGridWithOutput(proc, grid);
        //console.log(grid.toString());
        return proc.getLastOutput();
    }

    private divideAndSplitPath(path: (string | number)[]) {
        let replacements: string[] = ['A', 'B', 'C'];
        let funcs = [];
        for (let i = 0; i < path.length; i++) {
            for (let i2 = 10; i2 > 2; i2--) {
                let pathSegment = path.slice(i, i + i2);
                if (pathSegment.indexOf('A') < 0 &&
                    pathSegment.indexOf('B') < 0 &&
                    pathSegment.indexOf('C') < 0) {

                    const positions = this.locateInstances(path, pathSegment);
                    if (positions.length >= 2) {
                        const replacement = replacements.shift()!;
                        positions
                            .reverse()
                            .forEach(pos => path.splice(pos, pathSegment.length, replacement));
                        funcs.push(pathSegment);
                        i2 = 0;
                    }
                }
            }
        }
        return path.join(',') + '\n' + funcs.map(f => f.join(',')).join('\n');
    }

    private locateInstances(path: (string | number)[], segment: (string | number)[]): number[] {
        let positions: number[] = []
        for (let i = 0; i < path.length; i++) {
            if (path.slice(i, i + segment.length).join(',') === segment.join(',')) {
                positions.push(i);
            }
        }
        return positions;
    }

    private moveUntillStop([x, y]: [number, number], dir: number): {newPos: [number, number], length: number} {
        let delta = this.dirToDelta(dir);
        let size = 1;
        while(this.grid.get(x + (delta![0] * size), y + (delta![1] * size)) === '#') {
            size++;
        }
        size--;
        return {newPos: [x + (delta![0] * size), y + (delta![1] * size)], length: size};
    }

    private findDirectionFromPosition([x, y]: [number, number], dir: number): number {
        const leftDelta = this.dirToDelta((4 + (dir - 1)) % 4);
        const rightDelta = this.dirToDelta((4 + (dir + 1)) % 4);
        const canGoLeft = this.grid.get(x + leftDelta[0], y + leftDelta[1]) === '#';
        const canGoRight = this.grid.get(x + rightDelta[0], y + rightDelta[1]) === '#';
        if (!canGoLeft && !canGoRight) { return 0; /* the end */ }
        else if (canGoLeft && !canGoRight) { return -1; }
        else if (canGoRight&& !canGoLeft) { return 1; }
        else { throw 'Found T junction'; }
    }

    private dirToDelta(dir: number): [number, number] {
        let delta: [number, number];
        switch(dir) {
            case Direction.UP:    { delta = [0, 1 ]; } break;
            case Direction.DOWN:  { delta = [0, -1]; } break;
            case Direction.LEFT:  { delta = [-1, 0]; } break;
            case Direction.RIGHT: { delta = [1,  0]; } break;
        }
        return delta!;
    }

    private findPartA(program: number[]): number {
        const proc: IntCodeProcessor = new IntCodeProcessor([...program]);
        const grid: EndlessGrid<string> = this.grid;

        this.buildGridWithOutput(proc, grid);

        const junctions: [number, number][] = [];
        grid.forEach((cell, [x, y]) => {
            if (cell === '#') {
                if (grid.get(x - 1, y) === '#' &&
                    grid.get(x + 1, y) === '#' &&
                    grid.get(x, y + 1) === '#' &&
                    grid.get(x, y - 1) === '#') {
                    junctions.push([x, y]);
                }
            }
            if(cell === '^') {
                this.start = [x, y];
            }
        });
        return junctions.reduce((sum, [x, y]) => sum + (x * Math.abs(y)), 0);
    }

    private buildGridWithOutput(proc: IntCodeProcessor,  grid: EndlessGrid<string>) {
        let y = 0;
        let x = 0;
        proc.execute();
        proc.getOutput().forEach(digit => {
            if (digit > 1000) { return; }
            if (digit === 10) {
                x = 0;
                y--;
            } else {
                grid.set(x, y, String.fromCharCode(digit))
                x++;
            }
        });
    }

}

Runner(PuzzleSolution);