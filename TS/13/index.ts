import { Puzzle, Runner, BasePuzzle, Result } from '../shared/';
import { IntCodeProcessor } from '../02/int-code-processor.class';
import { terminal as term, ScreenBuffer } from 'terminal-kit';
import { Subject, interval } from 'rxjs';
import { takeUntil, map, bufferTime } from 'rxjs/operators';

enum CellType {
    EMPTY = ' ',
    WALL = '█',
    BLOCK = '░',
    PADDLE = '▃',
    BALL = '◉'
}

const updateRange = (input: [number, number], val: number) : [number, number] => {
    return [Math.min(input[0], val), Math.max(input[1], val)];
};
const cellIntToType = (val: number) => {
    switch(val) {
        case 0: return CellType.EMPTY;
        case 1: return CellType.WALL;
        case 2: return CellType.BLOCK;
        case 3: return CellType.PADDLE;
        case 4: return CellType.BALL;
    }
    throw 'Unknown type: ' + val;
};

class Game {
    private minMaxY: [number, number] = [0,0];
    private minMaxX: [number, number] = [0,0];
    private score = 0;
    private proc: IntCodeProcessor;
    private destroy$ = new Subject();
    private joystick = 0;
    private paddlePos = 0;
    private ballPos = 0;
    private screenBuffer?: ScreenBuffer;
    private autoMode = false;

    constructor(program: number[]) {
        program[0] = 2;
        this.proc = new IntCodeProcessor(program);
    }

    public abort() { this.destroy$.next(); }
    public activateAuto() { this.autoMode = true; }
    public neutral() { this.joystick = 0; }
    public left() { this.joystick = -1; }
    public right() { this.joystick = 1; }

    public run(speed: number) {
        this.initialRender();
        if (speed < 1) {
            while(!this.proc.getHasExited()) { this.tick(); }
            this.screenBuffer!.draw();
            return this.score;
        }
        return new Promise((resolve, reject) => {
            interval(speed).pipe(
                takeUntil(this.destroy$)
            ).subscribe(
                _ => {
                    if (this.proc.getHasExited()) {
                        this.destroy$.next();
                    } else {
                        this.tick();
                        this.screenBuffer!.draw();
                    }
                },
                () => reject('Game Failed'),
                () => {
                    console.log('\n');
                    resolve(this.score);
                });
        });
    }

    private tick() {
        let buf: number[] = [];
        this.proc.execute(true);
        buf.push(this.proc.getLastOutput());
        this.proc.execute(true);
        buf.push(this.proc.getLastOutput());
        this.proc.execute(true);
        buf.push(this.proc.getLastOutput());
        if (buf.length === 3 && buf[2] !== undefined) {
            this.drawBuffer(buf);
            buf = [];
            if (this.autoMode) {
                let nextJ = 0;
                if (this.paddlePos < this.ballPos) { nextJ = 1; }
                if (this.paddlePos > this.ballPos) { nextJ = -1; }
                this.proc.setInput([nextJ]);
            } else {
                this.proc.setInput([this.joystick]);
            }
        }
    }

    private initialRender() {
        term.clear();
        this.proc.execute(false, true);
        let buffer = this.proc.getOutput();
        this.collectRange(buffer);
        this.screenBuffer = new ScreenBuffer({
            width:  (this.minMaxX[1] - this.minMaxX[0]) + 1,
            height: (this.minMaxY[1] - this.minMaxY[0]) + 2,
            dst: term
        });
        this.drawBuffer(this.proc.getOutput());
        this.renderScore();
        this.screenBuffer!.draw();
    }

    private drawBuffer(buffer: number[]) {
        for (let b = 0; b < buffer.length; b+=3) {
            this.setCell(buffer.slice(b, b + 3) as [number, number, number]);
        }
    }

    private collectRange(buffer: number[]) {
        for (let b = 0; b < buffer.length; b+=3) {
            let cell = buffer.slice(b, b + 3);
            let x = cell[0];
            let y = cell[1];
            if (x >= 0 && y >= 0) {
                this.minMaxX = updateRange(this.minMaxX, x);
                this.minMaxY = updateRange(this.minMaxY, y);
            }
        }
    }

    private setCell(cell: [number, number, number], isInitial?: boolean) {
        let x = cell[0];
        let y = cell[1];
        if (x === -1 && y === 0) {
            this.score = cell[2];
            this.renderScore();
            return;
        }
        const cellType = cellIntToType(cell[2]);
        this.screenBuffer!.put(
            {x, y, dx:1, dy:0, attr: {defaultColor: true}, wrap: false},
            cellType
        );
        if (cellType === CellType.BALL) { this.ballPos = x; }
        if (cellType === CellType.PADDLE) {
            if (this.paddlePos !== x) {
                // this.joystick = 0;
                this.paddlePos = x;
            }
        }
    }

    private renderScore() {
        this.screenBuffer!.put(
            {x: 0, y: this.minMaxY[1]+1, dx:1, dy:0, attr: {defaultColor: true}, wrap: false},
            'score: ' + this.score
        );
    }
}

export class PuzzleSolution extends BasePuzzle implements Puzzle {
    private program: number[] = [];

    public run() {
        const result: Result = {};
        this.program = this.getInputAsRows(',').map(r => parseInt(r, 10));

        if (process.env.npm_lifecycle_event !== 'start13') {
            const proc = new IntCodeProcessor(this.program);
            proc.execute();
            const screenBuffer = proc.getOutput();
            result.a = screenBuffer.filter((tile, index) => index % 3 === 2 && tile == 2).length;
            result.b = 'Run   npm run start13   to execute'
        } else {
            result.b = this.initGame();
        }

        return result;
    }

    private initGame(): Promise<number> {
        const game = new Game(this.program);
        term.grabInput(true);
        term.on('key', (name: string) => {
            if ( name === 'CTRL_C' ) { term.grabInput(false); game.abort(); }
            if ( name === 'LEFT') { game.left(); }
            if ( name === 'RIGHT') { game.right(); }
            if ( name === 'UP') { game.neutral(); }
        });
        term.clear();
        term('Select play mode: \n');
        return term.singleColumnMenu(
            ['Normal', 'Auto', 'SuperAuto', 'HyperAuto'],
            {cancelable: true, exitOnUnexpectedKey: true}
        ).promise.then((response?: {selectedText: string}) => {
            if (!response) { return 0; }
            const choice = response.selectedText
            let speed = 100;
            if (choice === 'Auto' || choice === 'SuperAuto' || choice === 'HyperAuto') {
                game.activateAuto();
                if (choice === 'SuperAuto' ) { speed = 1; }
                if (choice === 'HyperAuto') { speed = 0; }
            }
            return game.run(speed);
        }).then(result => {
            term.grabInput(false);
            return result;
        }) as Promise<number>;
    }
}

Runner(PuzzleSolution);