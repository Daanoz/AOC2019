import { Puzzle, Runner, BasePuzzle, Result, GridCell, EndlessGrid } from '../shared/';

const START = '@';
const END = '?';

class MazeCell implements GridCell {
    private visited = false;
    private passable = false;

    constructor(private type: string) {
        this.passable =
            this.type !== '#' &&
            this.type !== ' ';
    }

    public reset() { return this.visited = false; }
    public resetClone() { return new MazeCell(this.type); }

    public markVisited() { this.visited = true; }
    public isPassable() { return this.passable; }
    public isVisited() { return this.visited; }
    public getType() { return this.type; }
    public getIsStart() { return this.type === START; }
    public getIsEnd() { return this.type === END; }
    public getIsPortal() { return typeof this.type === 'string' && this.type.charCodeAt(0) >= 65; }

    public toString() {
        if (this.type === '.' && this.isVisited()) {
            return '_';
        }
        return this.type;
    }
}

class Portal {
    private coord2?: [number, number];
    constructor(public name: string, private coord1: [number, number]) {

    }
    public setSecondCoord(coord: [number, number]) {
        this.coord2 = coord;
    }
    public warp(coord: [number, number], grid: EndlessGrid<MazeCell>): [number, number] {
        let c;
        if (coord[0] === this.coord1[0] && coord[1] === this.coord1[1]) {
            c = this.coord2!;
        } else {
            c = this.coord1;
        }
        const surroundingCoords: [number, number][] = [[c[0] - 1, c[1]], [c[0]+ 1, c[1]], [c[0], c[1] - 1], [c[0], c[1] + 1]];
        return surroundingCoords.find(c => grid.get(c[0], c[1], new MazeCell('#'))!.getType() === '.')!;
    }
}

class NavigatorA {
    private portals: Map<string, Portal> = new Map();

    constructor(protected grid: EndlessGrid<MazeCell>) {}

    protected getNeighbours([x, y]: [number, number]): [number, number][] {
        const coords: [number, number][] = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
        return coords
            .map(([x, y]) => ({ coord: [x, y] as [number, number], cell: this.grid.get(x, y)}))
            .map(c => {
                if (c.cell && c.cell.getIsPortal() && this.portals.has(c.cell!.getType())) {
                    const portal = this.portals.get(c.cell!.getType())!;
                    const newCoord = portal.warp(c.coord, this.grid);
                    return {coord: newCoord, cell: this.grid.get(newCoord[0], newCoord[1])};
                }
                return c;
            })
            .filter(c => this.isReadyToVisit(c.cell))
            .map(c => c.coord);
    }

    protected isReadyToVisit(cell?: MazeCell): boolean {
        if (!cell) { return false; }
        return !cell.isVisited() && cell.isPassable();
    }

    public findShortest(): number {
        const startCoordinate = this.grid!.findIndex(cell => cell.getIsStart())!;
        this.findPortals();
        const res = this.findShortestPath(startCoordinate);
        return res;
    }

    private findPortals() {
        this.grid.filterIndex(c => c.getIsPortal()).forEach(([x, y]) => {
            let cell = this.grid.get(x, y)!;
            if (this.portals.has(cell.getType())) {
                this.portals.get(cell.getType())!.setSecondCoord([x, y]);
            } else {
                this.portals.set(cell.getType(), new Portal(cell.getType(), [x, y]));
            }
        });
    }

    private findShortestPath(start: [number, number]): number {
        let currentLocations: Map<string, [number, number]> = new Map([[start.join(','), start]]);
        let distance = -1;
        while(currentLocations.size > 0) {
            let nextLocations: Map<string, [number, number]> = new Map();
            let endCoord = Array.from(currentLocations.values()).find(coord => {
                const cell = this.grid!.get(coord[0], coord[1])!;
                if(cell.getIsEnd()) {
                    return true
                }
                const neighbours = this.getNeighbours(coord);
                neighbours.forEach(neighbourCoord => {
                    if (!nextLocations.has(neighbourCoord.join(','))) {
                        nextLocations.set(neighbourCoord.join(','), neighbourCoord);
                    }
                });
                cell.markVisited();
                return false;
            });
            if (endCoord) { return distance - 1; }
            currentLocations = nextLocations;
            distance++;
        }
        return -1;
    }
}


class Portal3D {
    private coord2?: [number, number, number];
    constructor(public name: string, private coord1: [number, number, number]) { }

    public canGoThrough([x, y, z]: [number, number, number]): boolean {
        let otherCoord = this.findOtherCoord([x, y]);
        if (z + otherCoord[2] < 0 || z + otherCoord[2] > 150) {
            return false;
        }
        return true;
    }

    public setSecondCoord(coord: [number, number, number]) {
        this.coord2 = coord;
    }
    public warp([x, y, z]: [number, number, number], grids: EndlessGrid<MazeCell>[]): [number, number, number] {
        let c = this.findOtherCoord([x, y]);

        let targetGrid = z + c[2];
        if (!grids[targetGrid]) {
            grids[targetGrid] = grids[z]!.clone(m => m.resetClone());
        }

        const surroundingCoords: [number, number, number][] = [
            [c[0] - 1, c[1], targetGrid], [c[0] + 1, c[1], targetGrid],
            [c[0], c[1] - 1, targetGrid], [c[0], c[1] + 1, targetGrid]
        ];
        return surroundingCoords.find(c => grids[c[2]].get(c[0], c[1], new MazeCell('#'))!.getType() === '.')!;
    }

    private findOtherCoord([x, y]: [number, number]): [number, number, number] {
        if (x === this.coord1[0] && y === this.coord1[1]) {
            return this.coord2!;
        } else {
            return this.coord1;
        }
    }
}

class NavigatorB {
    protected grids: EndlessGrid<MazeCell>[];
    private portals: Map<string, Portal3D> = new Map();

    constructor(grid: EndlessGrid<MazeCell>) {
        this.grids = [grid];
     }

    protected getNeighbours([x, y, z]: [number, number, number]): [number, number, number][] {
        const coords: [number, number, number][] = [[x - 1, y, z], [x + 1, y, z], [x, y - 1, z], [x, y + 1, z]];
        return coords
            .map(([x, y, z]) => ({ coord: [x, y, z] as [number, number, number], cell: this.grids[z].get(x, y)}))
            .map(c => {
                if (c.cell && c.cell.getIsPortal() && this.portals.has(c.cell!.getType())) {
                    const portal = this.portals.get(c.cell!.getType())!;
                    if (!portal.canGoThrough(c.coord)) {
                        return ({coord: c.coord, cell: undefined});
                    }
                    const newCoord = portal.warp(c.coord, this.grids);
                    // console.log("Using " + portal.name + " to go from " + c.coord[2] + " to " + newCoord[2]);
                    return {coord: newCoord, cell: this.grids[newCoord[2]].get(newCoord[0], newCoord[1])};
                }
                return c;
            })
            .filter(c => this.isReadyToVisit(c.cell))
            .map(c => c.coord);
    }

    protected isReadyToVisit(cell?: MazeCell): boolean {
        if (!cell) { return false; }
        return !cell.isVisited() && cell.isPassable();
    }

    public findShortest(): number {
        const startCoordinate = this.grids[0]!.findIndex(cell => cell.getIsStart())!;
        this.findPortals(0);
        const res = this.findShortestPath([startCoordinate[0], startCoordinate[1], 0]);
        // this.grids.forEach((g, i) => console.log('level ' + (i) + ':\n' + g.toString()))
        return res;
    }

    private findPortals(z: number) {
        let width = this.grids[0].getWidth();
        let height = this.grids[0].getHeight();
        this.grids[z]!.filterIndex(c => c.getIsPortal()).forEach(([x, y]) => {
            let cell = this.grids[z]!.get(x, y)!;
            const isOuterPortal = x < 3 || x > width - 3 || Math.abs(y) < 3 || Math.abs(y) > height - 3;
            const gridDelta = isOuterPortal ? 1 : -1;
            if (this.portals.has(cell.getType())) {
                this.portals.get(cell.getType())!.setSecondCoord([x, y, gridDelta]);
            } else {
                this.portals.set(cell.getType(), new Portal3D(cell.getType(), [x, y, gridDelta]));
            }
        });
    }

    private findShortestPath(start: [number, number, number]): number {
        let currentLocations: Map<string, [number, number, number]> = new Map([[start.join(','), start]]);
        let distance = -1;
        while(currentLocations.size > 0) {
            let nextLocations: Map<string, [number, number, number]> = new Map();
            let endCoord = Array.from(currentLocations.values()).find(coord => {
                const cell = this.grids[coord[2]]!.get(coord[0], coord[1])!;
                if(coord[2] === 0 && cell.getIsEnd()) {
                    return true
                }
                const neighbours = this.getNeighbours(coord);
                neighbours.forEach(neighbourCoord => {
                    if (!nextLocations.has(neighbourCoord.join(','))) {
                        nextLocations.set(neighbourCoord.join(','), neighbourCoord);
                    }
                });
                cell.markVisited();
                return false;
            });
            if (endCoord) { return distance - 1; }
            currentLocations = nextLocations;
            distance++;
        }
        return -1;
    }
}

export class PuzzleSolution extends BasePuzzle implements Puzzle {
    public run() {
        const result: Result = {};

        const navA = new NavigatorA(this.getGridAndRecodePortals());
        result.a = navA.findShortest();

        const navB = new NavigatorB(this.getGridAndRecodePortals());
        result.b = navB.findShortest();

        return result;
    }

    private getGridAndRecodePortals(): EndlessGrid<MazeCell> {
        const grid = this.getInputAsGrid();

        let keyMap: Map<string, string> = new Map([['AA', START], ['ZZ', END]]);
        let keyCode = 65; // === A

        grid.forEach((cell, [x, y]) => {
            if (cell && cell.match(/[A-Z]/)) {
                const surroundingCoords: [number, number][] = [[- 1, 0], [+ 1, 0], [0, - 1], [0, + 1]];
                const floorCell = surroundingCoords.find(c => grid.get(x + c[0], y + c[1]) === '.');
                if (floorCell) {
                    const portalCell = grid.get(x + (floorCell[0] * -1), y + (floorCell[1] * -1), '');
                    if (portalCell!.match(/[A-Z]/)) {
                        let portalKey = cell + portalCell;
                        if (floorCell[0] > 0 || floorCell[1] < 0) {
                            portalKey = portalKey.split('').reverse().join('');
                        }
                        if (!keyMap.has(portalKey)) {
                            keyMap.set(portalKey, String.fromCharCode(keyCode));
                            keyCode++;
                        }
                        grid.set(x, y, keyMap.get(portalKey)!);
                        grid.set(x + (floorCell[0] * -1), y + (floorCell[1] * -1), ' ');
                    }
                }
            }
        })

        return grid.map<MazeCell>(cell => new MazeCell(cell));
    }
}

Runner(PuzzleSolution);