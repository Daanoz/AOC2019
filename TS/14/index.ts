import { Puzzle, Runner, BasePuzzle, Result } from '../shared/';

class Reaction {
    private leftOver = 0;

    constructor(private inputs: { element: Element, quantity: number}[],
                private outputs: { element: Element, quantity: number}) {
    }

    public reset() {
        this.leftOver = 0;
    }

    public findRawMaterials(quantity: number): Map<Element, number> {
        if (quantity < this.leftOver) {
            this.leftOver -= quantity;
            return new Map<Element, number>();
        } else {
            quantity -= this.leftOver;
            this.leftOver = 0;
        }
        const neededReactions = Math.ceil(quantity / this.outputs.quantity);
        const usedOfLastReaction = (quantity % this.outputs.quantity);
        if (usedOfLastReaction > 0) {
            this.leftOver = this.outputs.quantity - usedOfLastReaction;
        }
        const neededInput = this.inputs.map(input => ({
            element: input.element,
            quantity: input.quantity * neededReactions
        }));
        return neededInput.reduce((list, input) => {
            list.set(input.element, input.quantity);
            const requiredSubMaterials = input.element.findRawMaterials(input.quantity);
            Array.from(requiredSubMaterials.keys()).forEach(element => {
                if (list.has(element)) {
                    list.set(element, list.get(element)! + requiredSubMaterials.get(element)!);
                } else {
                    list.set(element, requiredSubMaterials.get(element)!);
                }
            });
            return list;
        }, new Map<Element, number>());
    }

    public static parse(value: string): {
        inputs: {name: string, quantity:number}[],
        output: {name: string, quantity:number}
    } {
        let regex = /(\d+) ([A-Z]+)/g;
        let match;
        let inputs = [];
        while ((match = regex.exec(value)) !== null) {
            inputs.push({
                name: match[2],
                quantity: parseInt(match[1], 10)
            });
        }
        let output = inputs.pop()!;
        return { inputs, output };
    }
}

class Element {
    private reaction?: Reaction;

    constructor(public name: string) {}

    public setReaction(reaction: Reaction) {
        this.reaction = reaction;
    }

    public findRawMaterials(quantity: number): Map<Element, number> {
        if (this.name === 'ORE') { return new Map<Element, number>(); }
        return this.reaction!.findRawMaterials(quantity);
    }
}

export class PuzzleSolution extends BasePuzzle implements Puzzle {
    private elements: Map<string, Element> = new Map();
    private reactions: Map<string, Reaction> = new Map();
    private ORE?: Element;
    private FUEL?: Element;

    public run() {
        const result: Result = {};
        const reactionList = this.getInputAsRows();

        this.parseIntoObjects(reactionList);
        this.generateReferenceTree();

        this.ORE = this.elements.get('ORE')!;
        this.FUEL = this.elements.get('FUEL')!;

        const oreForOneFuel = this.timed<number>('part A', () => this.oreForFuel(1));
        result.a = oreForOneFuel;
        const targetAmount = 1000000000000;
        let minimumAmountOfFuel = Math.round(targetAmount / oreForOneFuel);
        result.b = this.timed('part B', () => this.findFuelForOre(minimumAmountOfFuel, targetAmount, 100000));

        return result;
    }

    private findFuelForOre(start: number, target: number, increments: number): number {
        let locatedRange = false;
        let min = 0;
        while (!locatedRange) {
            min = this.oreForFuel(start);
            const max = this.oreForFuel(start + increments);
            if (min <= target && max >= target) {
                locatedRange = true;
                if (increments <= 1) { return start; }
            } else {
                start += increments;
            }
        }
        return this.findFuelForOre(start, target, Math.floor(increments / 10));
    }

    private oreForFuel(quantityOfFuel: number): number {
        this.reactions.forEach(r => r.reset());
        return this.FUEL!.findRawMaterials(quantityOfFuel).get(this.ORE!)!;
    }

    private parseIntoObjects(reactionList: string[]): void {
        const parsedReactions = reactionList.map(r => Reaction.parse(r));
        parsedReactions.forEach(reaction => reaction.inputs.concat(reaction.output).forEach(el => {
            if (!this.elements.has(el.name)) { this.elements.set(el.name, new Element(el.name)); }
        }));
        parsedReactions.forEach(reaction => {
            this.reactions.set(reaction.output.name, new Reaction(
                reaction.inputs.map(element => ({
                    element: this.elements.get(element.name)!, quantity: element.quantity
                })),
                {element: this.elements.get(reaction.output.name)!, quantity: reaction.output.quantity}
            ));
        })
    }

    private generateReferenceTree(): void {
        this.elements.forEach(element => {
            if (element.name != 'ORE') {
                element.setReaction(this.reactions.get(element.name)!);
            }
        });
    }

}

Runner(PuzzleSolution);