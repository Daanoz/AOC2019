import { Puzzle, Runner, BasePuzzle, Result, GridCell, EndlessGrid } from '../shared/';
import memoize from 'memoizee';

class MazeCell implements GridCell {
    private visited = false;
    private passable = false;

    constructor(private type: string) {
        this.passable = this.type !== '#';
    }

    public resetClone() { return new MazeCell(this.type); }
    public reset() { return this.visited = false; }

    public markVisited() { this.visited = true; }
    public isPassable() { return this.passable; }
    public isVisited() { return this.visited; }
    public getType() { return this.type; }
    public getIsKey() { return !!this.type.match(/[a-z]/); }
    public getIsDoor() { return !!this.type.match(/[A-Z]/); }

    public toString() {
        if (this.type === '.' && this.isVisited()) {
            return '_';
        }
        return this.type;
    }
}

class POILocation {
    constructor(public pos: [number, number],
                public distance: number,
                public type: string) {}
}

export class PuzzleSolution extends BasePuzzle implements Puzzle {
    private grid?: EndlessGrid<MazeCell>;
    private keyList: string[] = [];

    public run() {
        const result: Result = {};
        this.grid = this.getInputAsGrid().map<MazeCell>(cell => new MazeCell(cell));
        this.keyList = this.grid.filter(cell => cell.getIsKey()).map(cell => cell.getType());

        this.findKeys = memoize(
            this.findKeys.bind(this), { normalizer: (args) =>  args[0].join(',') + '|' + args[1].sort().join(',') }
        );

        const startCoordinate = this.grid!.findIndex(cell => cell.getType() === '@')!;
        result.a = this.findKeys(startCoordinate, []);

        return result;
    }

    private findKeys(start: [number, number], keysInInventory: string[]): number {
        this.grid!.forEach(c => c.reset());

        let foundKeys: POILocation[] = [];
        let foundDoors: POILocation[] = [];

        let currentLocations: Map<string, [number, number]> = new Map([[start.join(','), start]]);
        let distance = 0;
        while(currentLocations.size > 0) {
            let nextLocations: Map<string, [number, number]> = new Map();
            currentLocations.forEach(coord => {
                const cell = this.grid!.get(coord[0], coord[1])!;
                if(cell.getIsDoor()) {
                    foundDoors.push(new POILocation(coord, distance, cell.getType()));
                    if (keysInInventory.indexOf(cell.getType().toLowerCase()) < 0) {
                        return; // we cannot go trough
                    }
                }
                const neighbours = this.getNeighbours(coord);
                neighbours.forEach(neighbourCoord => {
                    if (!nextLocations.has(neighbourCoord.join(','))) {
                        nextLocations.set(neighbourCoord.join(','), neighbourCoord);
                    }
                });
                cell.markVisited();
                if(cell.getIsKey() && keysInInventory.indexOf(cell.getType()) < 0) {
                    foundKeys.push(new POILocation(coord, distance, cell.getType()));
                }
            })
            if (this.keyList.length === (foundKeys.length + keysInInventory.length)) {
                currentLocations = new Map(); // we are done
            } else {
                currentLocations = nextLocations;
                distance++;
            }
        }

        if (foundKeys.length < 1) { return 0; }

        let minDistance = Number.MAX_VALUE;
        foundKeys.forEach(key => {
            if (key.distance > minDistance) { return; }
            let distance = this.findKeys(key.pos, keysInInventory.concat([key.type]));
            minDistance = Math.min(distance + key.distance, minDistance);
        });
        return minDistance;
    }

    private getNeighbours([x, y]: [number, number]): [number, number][] {
        const coords: [number, number][] = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
        return coords.filter(neighbourCoord => this.isReadyToVisit(neighbourCoord));
    }

    private isReadyToVisit([x, y]: [number, number]): boolean {
        const cell = this.grid!.get(x, y);
        if (!cell) { return false; }
        return !cell.isVisited() && cell.isPassable();
    }
}

Runner(PuzzleSolution);