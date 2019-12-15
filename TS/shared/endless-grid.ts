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

    public has(x: number, y: number): boolean {
        if (!this.grid.has(y)) { return false; }
        return this.grid.get(y)!.has(x);
    }

    public count(): number {
        return Array.from(this.grid.keys()).reduce((totalSum, y) =>
            totalSum + Array.from(this.grid.get(y)!.values()).length
        , 0);
    }

    public toString(): string {
        let body = '';
        for(let y = this.yRange[1]; y >= this.yRange[0]; y--) {
            let row = '';
            for(let x = this.xRange[0]; x <= this.xRange[1]; x++) {
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