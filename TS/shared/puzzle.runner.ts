import program from 'commander';
import fs from 'fs';
import path from 'path';

import { Puzzle } from './puzzle.interface';

type Constructor<T> = new (...args: any[]) => T;

export const Runner = (PuzzleClass: Constructor<Puzzle>) => {
    if (process.env.NODE_ENV === 'test') { return; } // do not execute for tests

    program
        .option('-i, --input <input>', 'input file');
    program.parse(process.argv);

    const PuzzleDir = process.cwd();
    const inst = new PuzzleClass();

    let inputFile = 'input';
    if (program.input) {
        inputFile = program.input;
    }

    if (fs.existsSync(path.join(PuzzleDir, inputFile))) {
        inst.setInput(fs.readFileSync(path.join(PuzzleDir, inputFile), {encoding: 'utf-8'}));

        const start = (new Date()).getTime();
        const result = inst.run();

        const resultPromises = [];
        if (result) {
            if (result.a) {
                resultPromises.push(asPromise(result.a).then(res => console.log("Part A", res)))
            }
            if (result.b) {
                resultPromises.push(asPromise(result.b).then(res => console.log("Part B", res)))
            }
        }
        const complete = () => {
            const duration = (new Date()).getTime() - start;
            console.log("\nTotal time taken: " + duration + "ms")
            console.log(inst.getBenchmarks()
                .map(benchMark => benchMark.label + ": " + benchMark.time + "ms")
                .join(", ")
            );
        };
        Promise.all(resultPromises).then(complete);
    } else {
        console.error('Unable to locate input file: ', inputFile);
    }

}

const asPromise = (val: string | number | Promise<string | number | void>) => {
    if (val && val instanceof Promise) {
        return val;
    } else {
        return Promise.resolve(val);
    }
}