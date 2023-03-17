const promptSync = require("prompt-sync")({sigint: true});
import fs from "fs";
import path from "path";

/*
*   TODO: Extract functions into util file and main file
* */

function randomIntFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function selectRandomLineFromFile(filename: string): string {
    const filePath = path.join(__dirname, filename);
    const fileContent = fs.readFileSync(filePath, {encoding: "utf8"});
    const lines = fileContent
        .split(/\n|\r\n?/)
        .map((s: string) => s.trim());
    const numberOfLines = lines.length;
    if(numberOfLines < 1) throw new Error("No words in words.txt");
    return lines[randomIntFromInterval(0, numberOfLines)];
}

function readTextFromFile(filename: string): string {
    const filePath = path.join(__dirname, filename);
    return fs.readFileSync(filePath, {encoding: "utf8"});
}

enum GameStates {
    Live,
    GameOver,
    Victory
}

class Game {
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

    run(): void {
        while(this.state == GameStates.Live) {
            this.gameStep();
        }
    }

    /*
    * Recursive game loop function
    * */
    gameStep(): void {
        this.printProgress();
        
        const guess: string = this.promptForGuess();
        if(this.guesses.includes(guess)) {
            return;
        }

        if(!this.targetWord.includes(guess)) {
            this.lives -= 1;
            if(this.lives == 0) {
                this.state = GameStates.GameOver;
                this.doEndScreen();
                return;
            }
        }

        this.updateWorkingWord(guess);

        if(this.checkGuesses()) {
            this.state = GameStates.Victory;
            this.doEndScreen();
            return;
        }

        this.guesses.push(guess);
    }

    checkGuesses(): boolean {
        let i: number = this.targetWord.length;
        while(i--) {
            if(!this.guesses.includes(this.targetWord[(i)])) {
                return false;
            }
        }

        return true;
    }

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
        return selectRandomLineFromFile("assets/words.txt").toLowerCase();
    }

    promptForGuess(): string {
        const guess: string = promptSync("What is your guess? ").toLowerCase();
        if(guess.length == 1 && guess.match(/[a-z]/i)) {
            return guess;
        }

        console.log("Bad input");
        return this.promptForGuess();
    }
    
    printProgress(): void {
        console.clear();

        switch(this.lives) {
            case 6: console.log("\n".repeat(10)); break;
            case 5: console.log(readTextFromFile("assets/gallows/1.txt")); break;
            case 4: console.log(readTextFromFile("assets/gallows/2.txt")); break;
            case 3: console.log(readTextFromFile("assets/gallows/3.txt")); break;
            case 2: console.log(readTextFromFile("assets/gallows/4.txt")); break;
            case 1: console.log(readTextFromFile("assets/gallows/5.txt")); break;
        }

        console.log("\n" + this.workingWord);
        console.log(`\nGuesses: ${this.guesses.join(", ")}\n`);
    }

    doEndScreen(): void {
        const victoryText: string = readTextFromFile("assets/victory.txt");
        const gameOverText: string = readTextFromFile("assets/gallows/6.txt");

        console.clear();
        if(this.state == GameStates.Victory) {
            console.log(victoryText);
        }
        else if(this.state == GameStates.GameOver) {
            console.log(gameOverText);
        }
        else {
            throw new Error("Unexpected game state");
        }
        console.log(`\nThe word was: ${this.targetWord}`);
    }
}

function main(): void {
    let game = new Game();
    game.run();
}

main();
