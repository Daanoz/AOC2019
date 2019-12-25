import { Puzzle, Runner, BasePuzzle, Result, EndlessGrid } from '../shared/';

export class PuzzleSolution extends BasePuzzle implements Puzzle {
    public run() {
        const result: Result = {};

        result.a = this.partA();
        result.b = this.partB();

        return result;
    }


    private partA(): number {
        const calculateHash = (grid: EndlessGrid<string>) => {
            let index = 0;
            return grid.reduce((sum, cell) => {
                if (cell === '#') {
                    sum += Math.pow(2, index);
                }
                index++;
                return sum;
            }, 0);
        }

        let grid = this.getInputAsGrid();
        let history = [calculateHash(grid)];
        while(true) {
            grid = grid.map((cell, [x, y]) => {
                let bugCount = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]
                    .map(coord => grid.get(coord[0], coord[1], '.'))
                    .filter(cell => cell === '#')
                    .length;
                if (cell === '#' && bugCount !== 1) {
                    return '.';
                } else if (cell === '.' && bugCount >= 1 && bugCount <= 2) {
                    return '#';
                } else {
                    return cell;
                }
            });

            const gridHash = calculateHash(grid);
            if (history.indexOf(gridHash) >= 0) {
                return gridHash;
            } else {
                history.push(gridHash);
            }
        }
        return -1;
    }

    private partB(): number {
        let grids = new Map<number, EndlessGrid<string>>();
        const emptyGrid = this.getInputAsGrid().map(_ => '.');
        grids.set(0, this.getInputAsGrid());
        grids.set(1, emptyGrid.clone());
        grids.set(-1, emptyGrid.clone());
        const width = grids.get(0)!.getWidth();
        const height = grids.get(0)!.getHeight();
        let min = -1;
        let max = 1;

        const get3DCoord = (coord: number[]) => {
            if(!grids.has(coord[2])) { return '.' };
            return grids.get(coord[2])!.get(coord[0], coord[1], '.');
        };
        const getNeighbours = ([x1, y1, z1]: [number, number, number]): [number, number, number][] => {
            let list: [number, number, number][] = [[x1 - 1, y1, z1], [x1 + 1, y1, z1], [x1, y1 - 1, z1], [x1, y1 + 1, z1]];
            return list.reduce((newList: [number, number, number][], [x, y, z]) => {
                let movedToLevel = false;
                if (x < 0)        { newList.push([1, -2, z - 1]); movedToLevel = true; }
                if (x > width)    { newList.push([3, -2, z - 1]); movedToLevel = true; }
                if (y > 0)        { newList.push([2, -1, z - 1]); movedToLevel = true; }
                if (y < -height)  { newList.push([2, -3, z - 1]); movedToLevel = true; }
                if (x === 2 && y === -2) {
                    if (x1 === 2) {
                        newList.push(
                            [0, y1 > -2 ? 0 : -4, z + 1],
                            [1, y1 > -2 ? 0 : -4, z + 1],
                            [2, y1 > -2 ? 0 : -4, z + 1],
                            [3, y1 > -2 ? 0 : -4, z + 1],
                            [4, y1 > -2 ? 0 : -4, z + 1]
                        );
                    } else if(y1 === -2) {
                        newList.push(
                            [x1 < 2 ? 0 : 4, 0, z + 1],
                            [x1 < 2 ? 0 : 4, -1, z + 1],
                            [x1 < 2 ? 0 : 4, -2, z + 1],
                            [x1 < 2 ? 0 : 4, -3, z + 1],
                            [x1 < 2 ? 0 : 4, -4, z + 1]
                        );
                    } else {
                        throw 'This should not happen: ' + [x1, y1, z1]
                    }
                    movedToLevel = true;
                }
                if (!movedToLevel) {
                    newList.push([x, y, z]);
                }

                return newList;
            }, []);
        };
        const hasBugsOnOuterBorder = (grid:EndlessGrid<string>): boolean => {
            for (let x = 0; x < width; x++) {
                if (grid.get(x, 0) === '#' || grid.get(x, -4) === '#') {
                    return true;
                }
            }
            for (let y = 0; y > -height; y--) {
                if (grid.get(0, y) === '#' || grid.get(4, y) === '#') {
                    return true;
                }
            }
            return false;
        };
        const hasBugsOnInnerBorder = (grid:EndlessGrid<string>): boolean => {
            return grid.get(2, -1) === '#' ||
                   grid.get(2, -3) === '#' ||
                   grid.get(1, -2) === '#' ||
                   grid.get(3, -2) === '#';
        };

        for(let i = 0; i < 200; i++) {
            let newGrids = new Map<number, EndlessGrid<string>>();
            Array.from(grids.keys()).forEach(level => {
                let sourceGrid = grids.get(level)!;
                let newGrid = sourceGrid.map((cell, [x, y]) => {
                    if (x === 2 && y === -2) { return '?'; }
                    const bugCount = getNeighbours([x, y, level])
                        .map(coord => get3DCoord(coord))
                        .filter(cell => cell === '#')
                        .length;
                    if (cell === '#' && bugCount !== 1) {
                        return '.';
                    } else if (cell === '.' && bugCount >= 1 && bugCount <= 2) {
                        return '#';
                    } else {
                        return cell;
                    }
                });
                newGrids.set(level, newGrid);
            });
            grids = newGrids;
            if (hasBugsOnInnerBorder(grids.get(max)!)) {
                max++;
                grids.set(max, emptyGrid.clone());
            }
            if (hasBugsOnOuterBorder(grids.get(min)!)) {
                min--;
                grids.set(min, emptyGrid.clone());
            }
            // console.log('###############################')
            // console.log(i)
            // console.log('###############################')
            // Array.from(grids.keys()).sort().forEach(level => {
            //     let grid = grids.get(level)!;
            //     console.log('level ' + level + '\n' + grid.toString())
            // });
        }

        let bugCount = 0;
        Array.from(grids.keys()).sort().forEach(level => {
            let grid = grids.get(level)!;
            bugCount += grid.countBy(cell => cell === '#')
        });
        return bugCount;
    }
}

Runner(PuzzleSolution);