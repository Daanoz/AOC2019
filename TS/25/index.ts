import { Puzzle, Runner, BasePuzzle, Result } from '../shared/';
import { IntCodeProcessor } from '../02/int-code-processor.class';

const inverseDirection = (dir: string) => {
    switch(dir) {
        case 'north' : return 'south';
        case 'south' : return 'north';
        case 'west' : return 'east';
        case 'east' : return 'west';
    }
    throw 'unknown direction ' + dir;
}

class Cell {
    private doors: string[] = [];
    private visitedDoors: string[] = [];
    private previousRoom: Cell | undefined;
    private entryDirection: string | undefined;
    private items: string[] = [];
    public roomName: string;
    private roomDescription: string;

    constructor(description: string) {
        let parts: string[] = description.split('\n');
        let foundStart = false;
        while (!foundStart && parts.length > 0) {
            if (parts[0].startsWith('==')) { foundStart = true; }
            else { parts.shift(); }
        }
        if (parts.length < 1) {
            console.log(description);
            throw 'wierd?';
        }
        this.roomName = parts.shift()!;
        this.roomName = this.roomName.substring(3, this.roomName.length - 3);
        this.roomDescription = parts.shift()!;
        let parsingDoors = false;
        let parsingItems = false;
        while (parts.length > 0) {
            let line = parts.shift()!;
            if (line === '') { parsingDoors = false; parsingItems = false; }
            else if (line.startsWith('==')) { parts = []; } // abort parsing, we probably entered the security check
            else if (line === 'Doors here lead:') { parsingDoors = true; }
            else if (line === 'Items here:') { parsingItems = true; }
            else if (parsingDoors) { this.doors.push(line.substring(2)); }
            else if (parsingItems) { this.items.push(line.substring(2)); }
        }
    }

    public setEntry(previousCell: Cell, entry: string) {
        let entryDirection = inverseDirection(entry);
        this.previousRoom = previousCell;
        this.entryDirection = entryDirection;
        this.visitedDoors.push(entryDirection);
    }

    public getEntry() {
        return this.previousRoom;
    }
    public getEntryDirection() {
        return this.entryDirection;
    }
    public getItems() {
        return this.items;
    }

    public takeDoor(): string | undefined {
        if (this.doors.length === this.visitedDoors.length) {
            return undefined; // all doors are visited
        }
        let door = this.doors.find(door => this.visitedDoors.indexOf(door) < 0)!;
        this.visitedDoors.push(door);
        return door;
    }

    public toString() {
        return ' ' + this.roomName.substring(0, 5).padStart(5, ' ');
    }
}

export class PuzzleSolution extends BasePuzzle implements Puzzle {
    private program: number[] = [];
    private proc?: IntCodeProcessor;

    public run() {
        const result: Result = {};
        this.program = this.getInputAsRows(',').map(r => parseInt(r, 10));
        this.proc = new IntCodeProcessor(this.program);

        this.proc.execute(false, true);
        const hullbreachCell = new Cell(this.getOutput());
        let securityCheckPoint;
        let lastCell = hullbreachCell;

        let itemsNotToTake = ['photons', 'molten lava', 'giant electromagnet', 'escape pod', 'infinite loop'];

        let exploring = true;
        let itemsFound: string[] = [];
        while(exploring) {
            let direction = lastCell.takeDoor();
            if (direction) {
                this.write(direction + '\n');
                this.proc.execute(false, true);
                let newCell = new Cell(this.getOutput());
                newCell.setEntry(lastCell, direction);
                if (newCell.roomName === 'Pressure-Sensitive Floor') {
                    securityCheckPoint = newCell;
                    // We were put back
                    newCell = newCell.getEntry()!;
                }
                lastCell = newCell;
                lastCell.getItems().forEach(item => {
                    if (itemsNotToTake.indexOf(item) < 0) {
                        this.write('take ' + item + '\n');
                        this.proc!.execute(false, true);
                        itemsFound.push(item);
                    }
                });
            } else {
                let goBackThrough = lastCell.getEntryDirection();
                if (!goBackThrough) {
                    exploring = false;
                } else {
                    this.write(goBackThrough + '\n');
                    this.proc.execute(false, true);
                    lastCell = lastCell.getEntry()!;
                }
            }
        }

        if (!securityCheckPoint) {
            throw 'Unable to locate checkpoint';
        }

        let path = [];
        let lastPoint = securityCheckPoint;
        while (lastPoint !== hullbreachCell) {
            path.push(inverseDirection(lastPoint.getEntryDirection()!));
            lastPoint = lastPoint.getEntry()!;
        }
        let sensorDirection = path.shift();
        path.reverse().forEach(door => {
            this.write(door + '\n');
            this.proc!.execute(false, true);
        });
        // drop everything
        itemsFound.forEach(item => {
            this.write('drop ' + item + '\n');
            this.proc!.execute(false, true);
        });
        // lose all items that are just to heavy
        [...itemsFound].forEach((item, index) => {
            this.write('take ' + item + '\n');
            this.proc!.execute(false, true);
            this.write(sensorDirection + '\n');
            this.proc!.execute(false, true);
            if(this.getOutput().indexOf('Alert!') > 0) {
                if (this.getOutput().indexOf('lighter') > 0) {
                    // with this single item we are to heavy, so it can never succeed with a combination
                    itemsFound.splice(itemsFound.indexOf(item), 1);
                }
                this.write('drop ' + item + '\n');
                this.proc!.execute(false, true);
            } else {
                throw 'We passed with one item? This is unexpected...';
            }
        });

        let foundCombo = null
        for (let count = 2; count <= itemsFound.length && !foundCombo; count++) {
            const combos = this.generateCombinations(itemsFound, count);
            combos.find(combo => {
                combo.forEach(item => {
                    this.write('take ' + item + '\n');
                    this.proc!.execute(false, true);
                });
                this.write(sensorDirection + '\n');
                this.proc!.execute(false, true);
                if(this.getOutput().indexOf('Alert!') > 0) {
                    combo.forEach(item => {
                        this.write('drop ' + item + '\n');
                        this.proc!.execute(false, true);
                    });
                    return false;
                } else {
                    foundCombo = combo;
                    return true;
                }
            });
        }

        console.log(foundCombo, this.getOutput());
        return result;
    }


    private write(command: string) {
        this.proc!.setInput(
            command.split('').map(char => char.charCodeAt(0))
        )
    }

    private getOutput() {
        return this.proc!.getOutput().map(code => String.fromCharCode(code)).join('');
    }

    private generateCombinations(list: string[], count: number): string[][] {
        let result: string[][] = [];
        if (count === 1) { return list.map(item => [item]); }
        list = [...list]; // avoid mutation of original
        while(list.length > 1) {
            const val = list.shift()!;
            this.generateCombinations(
                list,
                count - 1
            ).forEach(subCombination => {
                result.push([val, ...subCombination]);
            })
        }
        return result;
    }
}

Runner(PuzzleSolution);