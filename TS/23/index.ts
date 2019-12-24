import { Puzzle, Runner, BasePuzzle, Result } from '../shared/';
import { IntCodeProcessor } from '../02/int-code-processor.class';

export class PuzzleSolution extends BasePuzzle implements Puzzle {
    private program: number[] = [];

    public run() {
        const result: Result = {};
        this.program = this.getInputAsRows(',').map(r => parseInt(r, 10));



        result.a = this.partA();
        result.b = this.partB();

        return result;
    }

    private partA(): number {
        const procs: IntCodeProcessor[] = [];

        let packets: Map<number, number[]> = new Map();
        let sendBuffer: Map<number, number[]> = new Map();

        for (let i = 0; i < 50; i++) {
            const proc = new IntCodeProcessor(this.program);
            proc.setInput([i]);
            proc.setInputValueOnEmpty(-1);
            procs.push(proc);
            sendBuffer.set(i, []);
        }

        while(!packets.has(255)) {
            for (let i = 0; i < 50; i++) {
                if (packets.has(i) && packets.get(i)!.length >= 1) {
                    packets.get(i)!.forEach(input => procs[i].appendInput(input));
                    packets.delete(i);
                }
                //console.log("run ", i);
                procs[i].execute();
                //console.log("done ", i);
                sendBuffer.set(i, sendBuffer.get(i)!.concat(procs[i].getOutput(true)));

                if (sendBuffer.get(i)!.length >= 3) {
                    let output = sendBuffer.get(i)!;
                    if (output.length % 3 !== 0) {
                        console.warn('Not handling misformed packet!', output);
                    }
                    for (let b = 0; b < output.length; b += 3) {
                        let target = output[b];
                        let packet = [output[b + 1], output[b + 2]];

                        if (!packets.has(target)) { packets.set(target, []); }
                        packets.set(target, packets.get(target)!.concat(packet));

                    }
                    sendBuffer.set(i, []);
                }
            }
        }

        return packets.get(255)![1];
    }

    private partB(): number {
        const procs: IntCodeProcessor[] = [];

        let packets: Map<number, number[]> = new Map();
        let sendBuffer: Map<number, number[]> = new Map();

        for (let i = 0; i < 50; i++) {
            const proc = new IntCodeProcessor(this.program);
            proc.setInput([i]);
            proc.setInputValueOnEmpty(-1);
            procs.push(proc);
            sendBuffer.set(i, []);
        }

        let lastYValue;
        let complete = false;

        while(!complete) {
            let idleCount = 0;
            for (let i = 0; i < 50; i++) {
                let hasInput = false;
                let hasOutput = false;
                if (packets.has(i) && packets.get(i)!.length >= 1) {
                    packets.get(i)!.forEach(input => procs[i].appendInput(input));
                    packets.delete(i);
                    hasInput = true;
                }
                procs[i].execute();
                if (procs[i].getOutput().length > 0) {
                    hasOutput = true;
                    sendBuffer.set(i, sendBuffer.get(i)!.concat(procs[i].getOutput(true)));
                }

                if(!hasInput && !hasOutput) {
                    idleCount++;
                }

                if (sendBuffer.get(i)!.length >= 3) {
                    let output = sendBuffer.get(i)!;
                    if (output.length % 3 !== 0) {
                        console.warn('Not handling misformed packet!', output);
                    }
                    for (let b = 0; b < output.length; b += 3) {
                        let target = output[b];
                        let packet = [output[b + 1], output[b + 2]];

                        if (!packets.has(target) || target === 255) { packets.set(target, []); }
                        packets.set(target, packets.get(target)!.concat(packet));

                    }
                    sendBuffer.set(i, []);
                }
            }

            if(idleCount === 50 && packets.has(255)) {
                let yValue = packets.get(255)![1];
                if (yValue === lastYValue) {
                    complete = true;
                }
                packets.set(0, packets.get(255)!);
                lastYValue = yValue;
                packets.delete(255);
            }
        }

        return lastYValue as number;
    }
}

Runner(PuzzleSolution);