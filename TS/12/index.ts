import { Puzzle, Runner, BasePuzzle, Result } from '../shared/';

class Moon {
    public position = [0, 0, 0];
    public velocity = [0, 0, 0];

    constructor(private posConf: string) {
        this.extractPosition();
    }

    private extractPosition() {
        const matches = this.posConf.match(/<x=([\d-]*), y=([\d-]*), z=([\d-]*)>/);
        if (!matches) { throw 'Parse error on ' + this.posConf; }
        this.position = [parseInt(matches[1], 10), parseInt(matches[2], 10), parseInt(matches[3], 10)]

    }

    public reset() {
        this.extractPosition();
        this.velocity = [0,0,0];
    }

    public applyGravity(moon: Moon) {
        this.position.forEach((pos, index) => this.applyGravityOnAxis(moon, index));
    }

    private applyGravityOnAxis(moon: Moon, axis: number) {
        if (this.position[axis] < moon.position[axis]) {
            this.velocity[axis]++;
        } else if (this.position[axis] > moon.position[axis]) {
            this.velocity[axis]--;
        }
    }

    public applyVelocity() {
        this.position.forEach((pos, index) => this.position[index] += this.velocity[index]);

    }

    public getEnergy(): number {
        return  (Math.abs(this.position[0]) + Math.abs(this.position[1]) + Math.abs(this.position[2])) *
                (Math.abs(this.velocity[0]) + Math.abs(this.velocity[1]) + Math.abs(this.velocity[2]));
    }

    public getHash(axis: number): [number, number] {
        return [this.position[axis], this.velocity[axis]];
    }
}


export class PuzzleSolution extends BasePuzzle implements Puzzle {
    private moons: Moon[] = [];
    private pairs: Moon[][] = [];
    private history: string[] = [];

    public args = {
        steps: 1000
    };

    public run() {
        const result: Result = {};

        const moonPositions = this.getInputAsRows();
        this.moons = moonPositions.map(m => new Moon(m));
        this.pairs = this.generateUniquePairs(this.moons);

        for(let s = 0; s < this.args.steps; s++) {
            this.timeTick();
        }
        result.a = this.moons.reduce((sum, moon) => sum + moon.getEnergy(), 0);

        this.moons.forEach(m => m.reset());
        result.b = this.locateTimeCycle();

        return result;
    }

    private locateTimeCycle(): number {
        const initialHashes = [this.getAxisHash(0), this.getAxisHash(1), this.getAxisHash(2)]
        const foundPositions = [0, 0, 0]
        let ticks = 0;
        while (foundPositions[0] === 0 || foundPositions[1] === 0 || foundPositions[2] === 0) {
            this.timeTick();
            ticks++;
            let hashes = [this.getAxisHash(0), this.getAxisHash(1), this.getAxisHash(2)];
            foundPositions.forEach((pos, index) => {
                if (pos === 0) {
                    if (initialHashes[index] === hashes[index]) {
                        foundPositions[index] = ticks;
                    }
                }
            })
        }
        const gcdXandY = (foundPositions[0] * foundPositions[1]) / this.gcd(foundPositions[0], foundPositions[1]);
        const gcd = (gcdXandY * foundPositions[2]) / this.gcd(gcdXandY, foundPositions[2]);
        return gcd;
    }

    private gcd(a: number, b:number): number {
        if (b > a) {
            let t = a;
            a = b;
            b = t;
        }
        while (true) {
            if (b == 0) return a;
            a %= b;
            if (a == 0) return b;
            b %= a;
        }
    }

    private getAxisHash(axis: number): string {
        return this.moons
            .reduce((h: number[], moon) => h.concat(moon.getHash(axis)), [])
            .join(',');
    }

    private timeTick() {
        this.applyGravity();
        this.applyVelocity();
    }

    private applyGravity() {
        this.pairs.forEach(([moonA, moonB]) => {
            moonA.applyGravity(moonB);
            moonB.applyGravity(moonA);
        });
    }

    private applyVelocity() {
        this.moons.forEach(moon => moon.applyVelocity());
    }

    private generateUniquePairs(moons: Moon[]): Moon[][] {
        let result: Moon[][] = [];
        let pairs: string[] = [];
        moons.forEach((moonA, indexA) => moons.forEach((moonB, indexB) => {
            if (moonA !== moonB) {
                let pairId = indexA + '_' + indexB;
                let pairIdAlt = indexB + '_' + indexA;
                if (pairs.indexOf(pairId) < 0 && pairs.indexOf(pairIdAlt) < 0) {
                    pairs.push(pairId);
                    result.push([moonA, moonB])
                }
            }
        }));
        return result;
    }
}

Runner(PuzzleSolution);