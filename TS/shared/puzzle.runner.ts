import program from 'commander';
import fs from 'fs';
import path from 'path';

import { Puzzle } from './puzzle.interface';

program
  .option('-i, --input <input>', 'input file');
program.parse(process.argv);

type Constructor<T> = new (...args: any[]) => T;

export const Runner = (PuzzleClass: Constructor<Puzzle>) => {
    const PuzzleDir = process.cwd();
    const inst = new PuzzleClass();

    let inputFile = 'input';
    if (program.input) {
        inputFile = program.input;
    }

    if (fs.existsSync(path.join(PuzzleDir, inputFile))) {
        inst.setInput(fs.readFileSync(path.join(PuzzleDir, inputFile), {encoding: 'utf-8'}))
    }

    inst.run();
}