export class IntCodeProcessor {
    private instructionPointer = 0;
    private instructions: number[] = [];
    private input: number[] = [];
    private inputIndex = 0;
    private output: number[] = [];
    private breakOnOutput = false;
    private hasExited = false;

    private opCodeMap: Map<number, (pm: number) => boolean> = new Map([
        [1, (pm) => this.opCodeAdd(pm)],
        [2, (pm) => this.opCodeMultiply(pm)],
        [3, (pm) => this.opCodeInput()],
        [4, (pm) => this.opCodeOutput(pm)],
        [5, (pm) => this.opCodeJumpIfTrue(pm)],
        [6, (pm) => this.opCodeJumpIfFalse(pm)],
        [7, (pm) => this.opCodeLessThen(pm)],
        [8, (pm) => this.opCodeEquals(pm)],
        [99, (pm) => this.opCodeComplete()],
    ])

    constructor(instructions: number[]) {
        this.instructions = [...instructions];
    }

    public setInput(input: number[]) {
        this.inputIndex = 0;
        this.input = input;
    }

    public appendInput(input: number) {
        this.input.push(input);
    }

    public getOutput() {
        return this.output;
    }

    public getHasExited() {
        return this.hasExited;
    }

    public readPosition(index: number) {
        return this.instructions[index];
    }

    public execute(breakOnOutput?: boolean) {
        this.output = [];
        this.breakOnOutput = breakOnOutput || false;
        while(this.next()) {}
    }

    private next(): boolean {
        const opCode = this.instructions[this.instructionPointer] % 100;
        const paramMode = Math.floor(this.instructions[this.instructionPointer] / 100);
        if (!this.opCodeMap.has(opCode)) {
            console.error('Program failure, unkown opCode:', opCode);
            return false;
        }
        return this.opCodeMap.get(opCode)!(paramMode);
    }

    private opCodeAdd(paramModes: number): boolean {
        const parameters = this.readParams(paramModes, 2);
        const outputAddress = this.instructions[this.instructionPointer + 3];
        this.instructions[outputAddress] = parameters[0] + parameters[1];
        this.instructionPointer += 4;
        return true;
    }

    private opCodeMultiply(paramModes: number): boolean {
        const parameters = this.readParams(paramModes, 2);
        const outputAddress = this.instructions[this.instructionPointer + 3];
        this.instructions[outputAddress] = parameters[0] * parameters[1];
        this.instructionPointer += 4;
        return true;
    }

    private opCodeInput(): boolean {
        const outputAddress = this.instructions[this.instructionPointer + 1];
        this.instructions[outputAddress] = this.input[this.inputIndex % this.input.length];
        this.inputIndex++;
        this.instructionPointer += 2;
        return true;
    }

    private opCodeOutput(paramModes: number): boolean {
        const parameters = this.readParams(paramModes, 1);
        this.output.push(parameters[0]);
        this.instructionPointer += 2;

        if (this.breakOnOutput) { // end result is found
            return false;
        }
        return true;
    }

    private opCodeJumpIfTrue(paramModes: number): boolean {
        const parameters = this.readParams(paramModes, 2);
        if (parameters[0] !== 0) {
            this.instructionPointer = parameters[1];
        } else {
            this.instructionPointer += 3;
        }
        return true;
    }

    private opCodeJumpIfFalse(paramModes: number): boolean {
        const parameters = this.readParams(paramModes, 2);
        if (parameters[0] === 0) {
            this.instructionPointer = parameters[1];
        } else {
            this.instructionPointer += 3;
        }
        return true;
    }

    private opCodeLessThen(paramModes: number): boolean {
        const parameters = this.readParams(paramModes, 2);
        const outputAddress = this.instructions[this.instructionPointer + 3];
        this.instructions[outputAddress] = parameters[0] < parameters[1] ? 1 : 0;
        this.instructionPointer += 4;
        return true;
    }

    private opCodeEquals(paramModes: number): boolean {
        const parameters = this.readParams(paramModes, 2);
        const outputAddress = this.instructions[this.instructionPointer + 3];
        this.instructions[outputAddress] = parameters[0] === parameters[1] ? 1 : 0;
        this.instructionPointer += 4;
        return true;
    }

    private opCodeComplete(): boolean {
        this.hasExited = true;
        return false;
    }

    private readParams(paramModes: number, paramCount: number): number[] {
        const parameters: number[] = [];
        for (let index = this.instructionPointer + 1; index <= this.instructionPointer + paramCount; index++) {
            const value = this.instructions[index];
            const paramMode = paramModes % 10;
            paramModes = Math.floor(paramModes / 10);
            if (paramMode === 1) {
                parameters.push(value);
            } else {
                parameters.push(this.instructions[value]);
            }
        }
        return parameters;
    }
}