export abstract class BasePuzzle {
    private timings: Map<string, {start: number, end: number, duration: number}> = new Map();
    private input: string = '';
    public setInput(data: string) {
        this.input = data;
    }
    protected getInput(): string {
        return this.input;
    }
    protected getInputAsRows(splitBy?: string | RegExp): string[] {
        return this.getInput().split(splitBy || /\r\n|\n|\r/);
    }
    protected getInputAsTable(splitByCol?: string | RegExp, splitByRow?: string | RegExp): string[][] {
        return this.getInputAsRows(splitByRow).map(row => row.split(splitByCol || ','));
    }

    protected timed<T>(label: string, func: Function): T {
        this.timerStart(label);
        const result = func();
        this.timerEnd(label);
        return result as T;
    }

    protected timerStart(label: string) {
        const existingTiming = this.timings.get(label);
        const startInMs = new Date().getMilliseconds();
        if (existingTiming) {
            existingTiming.duration += existingTiming.end - existingTiming.start;
            existingTiming.start = startInMs;
            existingTiming.end = startInMs;
        } else {
            this.timings.set(label, {
                start: startInMs,
                end: startInMs,
                duration: 0
            })
        }
    }
    protected timerEnd(label: string) {
        const existingTiming = this.timings.get(label);
        if (existingTiming) {
            existingTiming.end = new Date().getMilliseconds();
        }
    }
    public getBenchmarks(): {label: string, time: number}[] {
        return Array.from(this.timings.keys()).map(label => {
            const timing = this.timings.get(label)!;
            return {
                label,
                time: timing.duration + (timing.end - timing.start)
            }
        });
    }
}