export abstract class BasePuzzle {
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
}