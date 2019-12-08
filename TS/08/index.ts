import { Puzzle, Runner, BasePuzzle, Result } from '../shared/';

export class Image {
    private layers: ImageLayer[] = [];

    constructor(private width: number, private height: number) {}

    public load(data: string) {
        const chunkSize = this.width * this.height;
        for (let i = 0; i < data.length; i += chunkSize) {
            const layer = new ImageLayer(this.width, this.height);
            layer.load(data.slice(i, i + chunkSize));
            this.layers.push(layer);
        }
    }

    public findChecksum(): number {
        let fewestZeros = Number.MAX_VALUE;
        let fewestLayer: ImageLayer;
        this.layers.forEach(layer => {
            const layerZeros = layer.numberOf(0);
            if (layerZeros < fewestZeros) {
                fewestLayer = layer;
                fewestZeros = layerZeros;
            }
        });
        return fewestLayer!.numberOf(1) * fewestLayer!.numberOf(2);
    }

    public render(): string {
        let output = '';
        for(let y = 0; y < this.height; y++) {
            let row = '';
            for(let x = 0; x < this.width; x++) {
                row += this.fetchPixel(x, y);
            }
            output += row + '\n';
        }
        return output;
    }

    private fetchPixel(x: number, y: number): string {
        for (let i = 0; i < this.layers.length; i++) {
            let px = this.layers[i].getPixel(x, y);
            if (px < 2) {
                return px == 1 ? '█' : ' ';
            }
        }
        return ' ';
    }
}

class ImageLayer {
    private grid: number[][] = [];
    constructor(private width: number, private height: number) {}

    public load(data: string) {
        for(let h = 0; h < this.height; h++) {
            const row = data
                .slice(h * this.width, (h + 1) * this.width)
                .split('')
                .map(px => parseInt(px, 10))
            this.grid.push(row);
        }
    }

    public numberOf(value: number): number {
        return this.grid.reduce(
            (sum, row) => sum +
                row.reduce((rowSum, cell) => rowSum + (cell === value ? 1 : 0), 0)
        , 0)
    }

    public getPixel(x: number, y: number): number {
        return this.grid[y][x];
    }
}

export class PuzzleSolution extends BasePuzzle implements Puzzle {
    public run() {
        const result: Result = {};

        const image = new Image(25, 6);
        image.load(this.getInput());

        result.a = image.findChecksum();

        result.b = '\n' + image.render();

        return result;
    }

}

Runner(PuzzleSolution);