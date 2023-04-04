import fs from "fs";
import path from "path";

export function randomIntFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function selectRandomLineFromFile(filename: string): string {
    const filePath = path.join(__dirname, filename);
    const fileContent = fs.readFileSync(filePath, {encoding: "utf8"});
    const lines = fileContent
        .split(/\n|\r\n?/)
        .map((s: string) => s.trim());
    const numberOfLines = lines.length;
    if(numberOfLines < 1) throw new Error("No words in words.txt");
    return lines[randomIntFromInterval(0, numberOfLines)];
}

export function readTextFromFile(filename: string): string {
    const filePath = path.join(__dirname, filename);
    return fs.readFileSync(filePath, {encoding: "utf8"});
}
