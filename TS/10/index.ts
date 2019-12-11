import { Puzzle, Runner, BasePuzzle, Result } from '../shared/';

enum MapCell {
    ASTROID = '#',
    EMPTY = '.'
}

interface AstroidInSight {
    angle: number;
    astroid: [number, number];
    distance: number;
}

class AstroidMap {
    private astroids: [number, number][] = [];
    private bestAstroid?: [number, number];
    private astroidsInSight?: AstroidInSight[];

    constructor(map: string[][]) {
        map.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell === MapCell.ASTROID) {
                    this.astroids.push([x, y]);
                }
            });
        });
    }

    public locateBestAstroid(): number {
        return this.astroids.reduce((biggestCount, [x, y]) => {
            const astroidsInSight = this.getAstroidsInSight(x, y);
            if (astroidsInSight.length < biggestCount ) { return biggestCount; }
            this.bestAstroid = [x, y];
            this.astroidsInSight = astroidsInSight;
            return astroidsInSight.length;
        }, 0);
    }

    public locateNthZap(zapsRemaining: number): [number, number] | undefined {
        let zap;
        while(zapsRemaining > 0 && this.astroidsInSight!.length > 0) {
            if (this.astroidsInSight!.length < zapsRemaining) {
                // just zap all found astroids
                const locatedAstroids = this.astroidsInSight!.map(astroidInSight => astroidInSight.astroid);
                this.astroids = this.astroids.filter(astroid => locatedAstroids.indexOf(astroid) < 0);
                zapsRemaining -= this.astroidsInSight!.length;
                this.astroidsInSight = this.getAstroidsInSight(this.bestAstroid![0], this.bestAstroid![1]);
            } else {
                this.astroidsInSight!.sort((a, b) => a.angle - b.angle);
                return this.astroidsInSight![zapsRemaining - 1].astroid;
            }
        }
        return zap;
    }

    private getAstroidsInSight(x: number, y: number): AstroidInSight[] {
        let angleMap = new Map<number, AstroidInSight>();
        this.astroids.forEach((astroid) => {
            const [asX, asY] = astroid;
            if (!(asX === x && asY === y)) {
                const angle = this.getAngle(x, y, asX, asY);
                if (!angleMap.has(angle)) {
                    angleMap.set(angle, {
                        angle,
                        astroid,
                        distance: this.getDistance(x, y, asX, asY)
                    });
                } else {
                    const distance = this.getDistance(x, y, asX, asY);
                    if (angleMap.get(angle)!.distance > distance) {
                        angleMap.set(angle, {
                            angle,
                            astroid,
                            distance: distance
                        });
                    }
                }
            }
        });
        return Array.from(angleMap.values());
    }

    private getDistance(x: number, y: number, x2: number, y2: number): number {
        return Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
    }

    private getAngle(x: number, y: number, x2: number, y2: number): number {
        let offset = 360 + 90;
        return ((Math.atan2(y2 - y, x2 - x) * (180/Math.PI)) + offset) % 360;
    }
}


export class PuzzleSolution extends BasePuzzle implements Puzzle {
    public run() {
        const result: Result = {};
        const map = new AstroidMap(this.getInputAsTable(''));
        result.a = map.locateBestAstroid();
        const zap = map.locateNthZap(200);
        if (zap) {
            result.b = zap[0] * 100 + zap[1];
        }
        return result;
    }

}

Runner(PuzzleSolution);