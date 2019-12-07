import { Puzzle, Runner, BasePuzzle, Result } from '../shared/';

class OrbitalObject {
    public orbitingCenter?: OrbitalObject;

    constructor(public name: string) {}

    public setCenter(obj: OrbitalObject) {
        if (this.orbitingCenter) {
            throw 'Objects cannot directly orbit multiple objects'
        }
        this.orbitingCenter = obj;
    }

    public getOrbitCount(): number {
        if (!this.orbitingCenter) { return 0; }
        return this.orbitingCenter.getOrbitCount() + 1;
    }

    public getPathToRoot(): string[] {
        if (!this.orbitingCenter) { return [this.name]; }
        return [this.name, ...this.orbitingCenter.getPathToRoot()];
    }
}

export class PuzzleSolution extends BasePuzzle implements Puzzle {

    private constellation: Map<string, OrbitalObject> = new Map();

    public run() {
        const result: Result = {};

        const orbits = this.getInputAsRows().map(r => r.split(')'));
        orbits.forEach(([center, orbiting]) =>
            this.getOrbitalObject(orbiting).setCenter(this.getOrbitalObject(center))
        );

        result.a = Array.from(this.constellation.values())
            .map(obj => obj.getOrbitCount())
            .reduce((sum, c) => sum + c, 0)
        result.b = this.determineHopsToSanta();

        return result;
    }

    private determineHopsToSanta(): number {
        if (!this.constellation.has('SAN') || !this.constellation.has('YOU')) { return 0; }
        const santaPos: OrbitalObject = this.constellation.get('SAN')!.orbitingCenter!;
        const myPos: OrbitalObject = this.constellation.get('YOU')!.orbitingCenter!;

        const santaPathToRoot = santaPos.getPathToRoot().reverse();
        const myPathToRoot = myPos.getPathToRoot().reverse();

        for(let i = 0; i < santaPathToRoot.length; i++) {
            if (santaPathToRoot[i] !== myPathToRoot[i]) { // split point found
                return (santaPathToRoot.length - i) +
                       (myPathToRoot.length - i);
            }
        }

        return 0;
    }

    private getOrbitalObject(name: string): OrbitalObject {
        if (!this.constellation.has(name)) {
            this.constellation.set(name, new OrbitalObject(name));
        }
        return this.constellation.get(name)!;
    }

}

Runner(PuzzleSolution);