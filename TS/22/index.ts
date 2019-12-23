import { Puzzle, Runner, BasePuzzle, Result } from '../shared/';
import bigInt from 'big-integer';

enum Action {
    NEW_STACK,
    CUT,
    DEAL_WITH_INCREMENT
}

interface IDeck {
    reverse(): void;
    cut(count: number): void;
    deal(count: number): void;
}

class Deck implements IDeck {
    private cards: number[] = [];
    constructor(count: number) {
        for(let i = 0; i < count; i++) {
            this.cards.push(i);
        }
    }

    public reverse() {
        this.cards = this.cards.reverse();
    }
    public cut(count: number) {
        const sliceLeft  = (this.cards.length + count) % this.cards.length;
        const cut = this.cards.splice(0, sliceLeft);
        this.cards.push(...cut);
    }
    public deal(count: number) {
        const newStack = new Array(this.cards.length);
        let dealIndex = 0;
        for (let i = 0; i < this.cards.length; i++) {
            newStack[dealIndex % this.cards.length] = this.cards[i];
            dealIndex += count;
        }
        this.cards = newStack;
    }
    public getCards(): number[] {
        return this.cards;
    }
    public getCard(index: number): number {
        return this.cards[index];
    }
    public getCardIndex(card: number): number {
        return this.cards.indexOf(card);
    }
}

class SmartDeck implements IDeck {
    constructor(private cardCount: number, private cardTotrack: number) {}

    public reverse() {
        this.cardTotrack = (this.cardCount - 1) - this.cardTotrack;
    }
    public cut(count: number) {
        const sliceLeft  = (this.cardCount + count) % this.cardCount;
        if (this.cardTotrack < sliceLeft) {
            this.cardTotrack = (this.cardCount - sliceLeft) + this.cardTotrack;
        } else {
            this.cardTotrack -= sliceLeft;
        }
    }
    public deal(count: number) {
        this.cardTotrack = (count * this.cardTotrack) % this.cardCount;
    }
    public getCardIndex(): number {
        return this.cardTotrack;
    }
}

class ShuffleAction {
    private action: Action;
    private value: number = 0;

    constructor(input: string) {
        if (input === 'deal into new stack') {
            this.action = Action.NEW_STACK;
        } else if(input.startsWith("deal with increment ")) {
            this.action = Action.DEAL_WITH_INCREMENT;
            this.value = parseInt(input.substring("deal with increment ".length), 10);
        } else if(input.startsWith("cut ")) {
            this.action = Action.CUT;
            this.value = parseInt(input.substring("cut ".length), 10);
        } else {
            throw "Unknown input " + input;
        }
    }

    public apply(deck: IDeck) {
        switch(this.action) {
            case Action.NEW_STACK: deck.reverse(); break;
            case Action.CUT: deck.cut(this.value); break;
            case Action.DEAL_WITH_INCREMENT: deck.deal(this.value); break;
        }
    }

    public getAction() { return this.action; }
    public getValue() { return this.value; }
}

export class PuzzleSolution extends BasePuzzle implements Puzzle {
    public args = {
        deckSizePartA: 10007,
        cardToFindPartA: 2019,

        deckSizePartB: 119315717514047,
        iterationsPartB: 101741582076661,
        cardToFindPartB: 2020
    }

    public run() {
        const result: Result = {};
        const actions = this.getInputAsRows().map(line => new ShuffleAction(line));
        const deckA = new Deck(this.args.deckSizePartA);
        actions.forEach(action => action.apply(deckA));
        result.meta = { cards: deckA.getCards()};
        result.a = deckA.getCardIndex(this.args.cardToFindPartA);


        // Left as reference; will take 3.8 years :D
        /*
        const deckB = new SmartDeck(this.args.deckSizePartB, this.args.cardToFindPartB);
        let start = new Date().getTime();
        for (let i = 0; i < this.args.iterationsPartB; i++) {
            actions.forEach(action => action.apply(deckB));

            if (i % 10000000 === 0 && i !== 0) {
                const duration = new Date().getTime() - start;
                const factor = (i/this.args.iterationsPartB);
                console.log(
                    '['+Math.round(duration/1000)+']' +
                    ' Ran for: ' + i + ' times (' + Math.round(factor*100) + '%)' +
                    ' remaining: ' + Math.round((((1 / factor) * duration) - duration)/1000) + 's' +
                    ' currentIndex: ' + deckB.getCardIndex()
                );
            }
        }
        result.b = deckB.getCardIndex();
        */
        result.b = this.reduceActions(actions, bigInt(this.args.deckSizePartB))
                                      (bigInt(this.args.iterationsPartB), this.args.cardToFindPartB);
        return result;
    }

    public reduceActions(actions: ShuffleAction[], deckSize: bigInt.BigInteger): (interations: bigInt.BigInteger, cardIndex: number) => number {
        const signedModulo = (value: bigInt.BigInteger) => (value.mod(deckSize).plus(deckSize).mod(deckSize));
        const inverse = (value: bigInt.BigInteger) => value.modPow(deckSize.subtract(2), deckSize);

        let cardIncrement = bigInt(1); // from the start, all digits increase by 1
        let cardOffset = bigInt(0); // from the start, card 0 is at 0
        actions.forEach(action => {
            switch(action.getAction()) {
                case Action.NEW_STACK: {
                    cardIncrement = cardIncrement.multiply(-1); // reverse increments between cards
                    cardIncrement = signedModulo(cardIncrement); // constrain by the decksize
                    cardOffset = cardOffset.add(cardIncrement); // first card is now moved by the new increment
                    cardOffset = signedModulo(cardOffset); // constrain by the decksize
                }; break;
                case Action.CUT: {
                    cardOffset = cardOffset.add(bigInt(action.getValue()).multiply(cardIncrement)) // take the n cards, multiplied by the increment
                    cardOffset = signedModulo(cardOffset); // constrain by the decksize
                }; break;
                case Action.DEAL_WITH_INCREMENT: {
                    cardIncrement = cardIncrement.multiply(inverse(bigInt(action.getValue()))); // every card is moved by n places
                    cardIncrement = signedModulo(cardIncrement); // constrain by the decksize
                }; break;
            }
        });

        return (interations: bigInt.BigInteger, cardIndex: number): number => {
            let incrementAfterIterations = cardIncrement.modPow(interations, deckSize);

            const inv = inverse(signedModulo(cardIncrement.minus(1)));
            // we want to multiply the offset by the total increment
            let offsetAfterIterations = cardOffset.multiply(incrementAfterIterations.minus(1)).multiply(inv);
            offsetAfterIterations = signedModulo(offsetAfterIterations); // constrain by the decksize

            // base offset + the increment the card needs for the index
            let cardOffsetAfterIterations = offsetAfterIterations.plus(bigInt(cardIndex).multiply(incrementAfterIterations));
            return signedModulo(cardOffsetAfterIterations).toJSNumber(); // constrain by the decksize, convert to normal number
        };
    }

}

Runner(PuzzleSolution);