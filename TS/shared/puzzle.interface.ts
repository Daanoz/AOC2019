export interface Result {
    a?: string | number,
    b?: string | number
}

export interface Puzzle {
    setInput(data: string): void;
    run(): Result | undefined;
    getBenchmarks(): {label: string, time: number}[];
}