import * as utils from "./utils";
const promptSync = require("prompt-sync")({sigint: true});

enum GameStates {
    Live,
    GameOver,
    Victory
}

export class Game {
    lives: number;
    targetWord: string;
    workingWord: string;
    guesses: string[];
    state: GameStates;

    constructor() {
        const targetWord = this.generateTargetWord();
        this.lives = 6;
        this.targetWord = targetWord;
        this.workingWord = "_".repeat(targetWord.length);
        this.guesses = [];
        this.state = GameStates.Live;
    }

    start(): void {
        while(this.state == GameStates.Live) {
            this.doOneGameStep();
        }
        this.doEndScreen();
    }

    doOneGameStep(): void {
        this.printProgress();
        
        const guess: string = this.promptForGuess();
        if(this.guesses.includes(guess)) {
            return;
        }

        this.updateWorkingWord(guess);
        this.guesses.push(guess);

        if(!this.targetWord.includes(guess)) {
            this.lives -= 1;
            if(this.lives == 0) {
                this.state = GameStates.GameOver;
                return;
            }
        }

        if(this.isWordGuessed()) {
            this.state = GameStates.Victory;
            return;
        }
    }

    /* Word guessed if player's guesses contains all letters in the target word.
     */
    isWordGuessed(): boolean {
        let i: number = this.targetWord.length;
        while(i--) {
            if(!this.guesses.includes(this.targetWord[(i)])) {
                return false;
            }
        }

        return true;
    }

    /* Insert guesses into correct position in working word, replacing underscores.
     */
    updateWorkingWord(guess: string): void {
        for(let i: number = 0; i < this.targetWord.length; i++) {
            if(this.targetWord[i] == guess) {
                let workingWordChars = [...this.workingWord];
                workingWordChars[i] = guess;
                this.workingWord = workingWordChars.join("");
            }
        } 
    }

    generateTargetWord(): string {
        return utils.selectRandomLineFromFile("assets/words.txt").toLowerCase();
    }

    promptForGuess(): string {
        const guess: string = promptSync("What is your guess? ").toLowerCase();
        if(guess.length != 1 || !guess.match(/[a-z]/i)) {
            console.log("Please only type in a single character.");
            return this.promptForGuess();
        }

        return guess;
    }
    
    printProgress(): void {
        console.clear();

        switch(this.lives) {
            case 6: console.log("\n".repeat(10)); break;
            case 5: console.log(utils.readTextFromFile("assets/gallows/1.txt")); break;
            case 4: console.log(utils.readTextFromFile("assets/gallows/2.txt")); break;
            case 3: console.log(utils.readTextFromFile("assets/gallows/3.txt")); break;
            case 2: console.log(utils.readTextFromFile("assets/gallows/4.txt")); break;
            case 1: console.log(utils.readTextFromFile("assets/gallows/5.txt")); break;
            default: throw new Error("An unexpected number of lives was found.");
        }

        console.log("\n" + this.workingWord);
        console.log(`\nGuesses: ${this.guesses.join(", ")}\n`);
    }

    doEndScreen(): void {
        console.clear();
        if(this.state == GameStates.Victory) {
            console.log(utils.readTextFromFile("assets/victory.txt"));
        }
        else if(this.state == GameStates.GameOver) {
            console.log(utils.readTextFromFile("assets/gallows/6.txt"));
        }
        else {
            throw new Error("Unexpected game state.");
        }
        console.log(`\nThe word was: ${this.targetWord}`);
    }
}
