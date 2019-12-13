export class IntCodeProcessor {
    private instructionPointer = 0;
    private instructions: number[] = [];
    private input: number[] = [];
    private inputIndex = 0;
    private output: number[] = [];
    private breakOnOutput = false;
    private breakOnInput = false;
    private hasExited = false;
    private relativeBase = 0;

    private opCodeMap: Map<number, (pm: number) => boolean> = new Map([
        [1, (pm) => this.opCodeAdd(pm)],
        [2, (pm) => this.opCodeMultiply(pm)],
        [3, (pm) => this.opCodeInput(pm)],
        [4, (pm) => this.opCodeOutput(pm)],
        [5, (pm) => this.opCodeJumpIfTrue(pm)],
        [6, (pm) => this.opCodeJumpIfFalse(pm)],
        [7, (pm) => this.opCodeLessThen(pm)],
        [8, (pm) => this.opCodeEquals(pm)],
        [9, (pm) => this.opCodeAdjustRelativeBase(pm)],
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

    public getOutput(): number[] {
        return this.output;
    }
    public getLastOutput(): number {
        return this.output[this.output.length - 1];
    }

    public getHasExited(): boolean {
        return this.hasExited;
    }

    public readPosition(index: number): number {
        return this.readAddress(index);
    }

    public execute(breakOnOutput?: boolean, breakOnInput?: boolean) {
        this.output = [];
        this.breakOnOutput = breakOnOutput || false;
        this.breakOnInput = breakOnInput || false;
        while(this.next()) {}
    }

    private next(): boolean {
        const instruction = this.readAddress(this.instructionPointer);
        const opCode = instruction % 100;
        const paramMode = Math.floor(instruction / 100);
        if (!this.opCodeMap.has(opCode)) {
            console.error('Program failure, unkown opCode:', opCode);
            return false;
        }
        return this.opCodeMap.get(opCode)!(paramMode);
    }

    private opCodeAdd(paramModes: number): boolean {
        const parameters = this.parseParams(paramModes, 3);
        this.writeAddress(parameters[2].address!, parameters[0].value + parameters[1].value);
        this.instructionPointer += 4;
        return true;
    }

    private opCodeMultiply(paramModes: number): boolean {
        const parameters = this.parseParams(paramModes, 3);
        this.writeAddress(parameters[2].address!, parameters[0].value * parameters[1].value);
        this.instructionPointer += 4;
        return true;
    }

    private opCodeInput(paramModes: number): boolean {
        const parameters = this.parseParams(paramModes, 1);
        if (this.inputIndex > this.input.length && this.breakOnInput) {
            return false;
        }
        this.writeAddress(parameters[0].address!, this.input[this.inputIndex]);
        this.inputIndex++;
        this.instructionPointer += 2;
        return true;
    }

    private opCodeOutput(paramModes: number): boolean {
        const parameters = this.parseParams(paramModes, 1);
        this.output.push(parameters[0].value);
        this.instructionPointer += 2;

        if (this.breakOnOutput) { // end result is found
            return false;
        }
        return true;
    }

    private opCodeJumpIfTrue(paramModes: number): boolean {
        const parameters = this.parseParams(paramModes, 2);
        if (parameters[0].value !== 0) {
            this.instructionPointer = parameters[1].value;
        } else {
            this.instructionPointer += 3;
        }
        return true;
    }

    private opCodeJumpIfFalse(paramModes: number): boolean {
        const parameters = this.parseParams(paramModes, 2);
        if (parameters[0].value === 0) {
            this.instructionPointer = parameters[1].value;
        } else {
            this.instructionPointer += 3;
        }
        return true;
    }

    private opCodeLessThen(paramModes: number): boolean {
        const parameters = this.parseParams(paramModes, 3);
        this.writeAddress(parameters[2].address!, parameters[0].value < parameters[1].value ? 1 : 0);
        this.instructionPointer += 4;
        return true;
    }

    private opCodeEquals(paramModes: number): boolean {
        const parameters = this.parseParams(paramModes, 3);
        this.writeAddress(parameters[2].address!, parameters[0].value === parameters[1].value ? 1 : 0);
        this.instructionPointer += 4;
        return true;
    }

    private opCodeAdjustRelativeBase(paramModes: number): boolean {
        const parameters = this.parseParams(paramModes, 1);
        this.relativeBase += parameters[0].value;
        this.instructionPointer += 2;
        return true;
    }

    private opCodeComplete(): boolean {
        this.hasExited = true;
        return false;
    }

    private parseParams(paramModes: number, paramCount: number): {address?: number, value: number}[] {
        const parameters: {address?: number, value: number}[] = [];
        for (let index = this.instructionPointer + 1; index <= this.instructionPointer + paramCount; index++) {
            const value = this.readAddress(index);
            const paramMode = paramModes % 10;
            paramModes = Math.floor(paramModes / 10);
            switch (paramMode) {
                case 2: { parameters.push({
                    address: this.relativeBase + value,
                    value: this.readAddress(this.relativeBase + value)
                }); } break;
                case 1: { parameters.push({
                    value
                }); } break;
                case 0: { parameters.push({
                    address: value,
                    value: this.readAddress(value)
                }); } break;
                default: {
                    throw "Unknown paramMode " + paramMode;
                }
            }
        }
        return parameters;
    }

    private readAddress(address: number): number {
        const result = this.instructions[address];
        if (!result) {
            return 0;
        }
        return result;
    }
    private writeAddress(address: number, value: number) {
        this.instructions[address] = value;
    }
}