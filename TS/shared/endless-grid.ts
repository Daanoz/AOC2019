const updateRange = (input: [number, number], val: number) : [number, number] => {
    return [Math.min(input[0], val), Math.max(input[1], val)];
};

export interface GridCell {
    toString(): string
};

export class EndlessGrid<T extends string | GridCell> {
    private grid: Map<number, Map<number, T>> = new Map();
    private xRange: [number, number] = [0, 0];
    private yRange: [number, number] = [0, 0];

    constructor() {}

    public set(x: number, y: number, value: T) {
        if (!this.grid.has(y)) { this.grid.set(y, new Map()); }
        this.grid.get(y)!.set(x, value);
        this.xRange = updateRange(this.xRange, x);
        this.yRange = updateRange(this.yRange, y);
    }

    public get(x: number, y: number, defaultValue?: any): T | undefined {
        if (!this.grid.has(y)) {
            return defaultValue;
        }
        return this.grid.get(y)!.get(x) || defaultValue
    }

    public getRow(y: number): T[] {
        const results: T[] = [];
        if (this.grid.has(y)) {
            for(let x = this.xRange[0]; x <= this.xRange[1]; x++) {
                if (this.has(x, y)) {
                    results.push(this.get(x, y)!);
                }
            }
        }
        return results;
    }

    public getColumn(x: number): T[] {
        const results: T[] = [];
        for(let y = this.yRange[1]; y >= this.yRange[0]; y--) {
            if (this.has(x, y)) {
                results.push(this.get(x, y)!);
            }
        }
        return results;
    }

    public has(x: number, y: number): boolean {
        if (!this.grid.has(y)) { return false; }
        return this.grid.get(y)!.has(x);
    }

    public count(): number {
        return Array.from(this.grid.keys()).reduce((totalSum, y) =>
            totalSum + Array.from(this.grid.get(y)!.values()).length
        , 0);
    }

    public countBy(callbackfn: (value: T, index: [number, number]) => boolean): number {
        return this.filter(callbackfn).length;
    }


    public forEach(callbackfn: (value: T, index: [number, number]) => void, defaultValue?: any): void {
        for(let y = this.yRange[1]; y >= this.yRange[0]; y--) {
            for(let x = this.xRange[0]; x <= this.xRange[1]; x++) {
                callbackfn(this.get(x, y, defaultValue)!, [x, y]);
            }
        }
    }

    public clone(callbackfn?: (value: T, index: [number, number]) => T): EndlessGrid<T> {
        return this.map<T>(callbackfn || (a => a));
    }

    public map<T2 extends string | GridCell>(callbackfn: (value: T, index: [number, number]) => T2): EndlessGrid<T2> {
        const mappedGrid = new EndlessGrid<T2>();
        for(let y = this.yRange[1]; y >= this.yRange[0]; y--) {
            for(let x = this.xRange[0]; x <= this.xRange[1]; x++) {
                if (this.has(x, y)) {
                    mappedGrid.set(x, y, callbackfn(this.get(x, y)!, [x, y]));
                }
            }
        }
        return mappedGrid;
    }

    public filterRow(y: number, callbackfn: (value: T, index: [number, number]) => boolean): T[] {
        const results: T[] = [];
        if (this.grid.has(y)) {
            for(let x = this.xRange[0]; x <= this.xRange[1]; x++) {
                if (this.has(x, y)) {
                    const cell = this.get(x, y)!;
                    if (callbackfn(cell, [x, y])) {
                        results.push(cell);
                    }
                }
            }
        }
        return results;
    }

    public filterColumn(x: number, callbackfn: (value: T, index: [number, number]) => boolean): T[] {
        const results: T[] = [];
        for(let y = this.yRange[1]; y >= this.yRange[0]; y--) {
            if (this.has(x, y)) {
                const cell = this.get(x, y)!;
                if (callbackfn(cell, [x, y])) {
                    results.push(cell);
                }
            }
        }
        return results;
    }

    public filter(callbackfn: (value: T, index: [number, number]) => boolean): T[] {
        const results: T[] = [];
        for(let y = this.yRange[1]; y >= this.yRange[0]; y--) {
            for(let x = this.xRange[0]; x <= this.xRange[1]; x++) {
                if (this.has(x, y)) {
                    const cell = this.get(x, y)!;
                    if (callbackfn(cell, [x, y])) {
                        results.push(cell);
                    }
                }
            }
        }
        return results;
    }

    public filterIndex(callbackfn: (value: T, index: [number, number]) => boolean): [number, number][] {
        const results: [number, number][] = [];
        for(let y = this.yRange[1]; y >= this.yRange[0]; y--) {
            for(let x = this.xRange[0]; x <= this.xRange[1]; x++) {
                if (this.has(x, y)) {
                    const cell = this.get(x, y)!;
                    if (callbackfn(cell, [x, y])) {
                        results.push([x, y]);
                    }
                }
            }
        }
        return results;
    }

    public findIndex(callbackfn: (value: T, index: [number, number]) => boolean): [number, number] | undefined {
        for(let y = this.yRange[1]; y >= this.yRange[0]; y--) {
            for(let x = this.xRange[0]; x <= this.xRange[1]; x++) {
                if (this.has(x, y)) {
                    const cell = this.get(x, y)!;
                    if (callbackfn(cell, [x, y])) {
                        return [x, y];
                    }
                }
            }
        }
        return undefined;
    }

    public find(callbackfn: (value: T, index: [number, number]) => boolean): T | undefined {
        let index = this.findIndex(callbackfn);
        if (index) { return this.get(index[0], index[1])!; }
        return undefined;
    }

    public toString(xStart?: number, yStart?: number, xEnd?: number, yEnd?: number): string {
        let body = '';
        for(let y = yEnd || this.yRange[1]; y >= (yStart || this.yRange[0]); y--) {
            let row = '';
            for(let x = xStart || this.xRange[0]; x <= (xEnd || this.xRange[1]); x++) {
                let cell = this.get(x, y, ' ')
                if (typeof cell === 'string') {
                    row += cell;
                } else {
                    row += (cell as GridCell).toString();
                }
            }
            body += row + '\n';
        }
        return body;
    }
}