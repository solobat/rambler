import { IWord, db } from "../db/dictsdb";

export default class Word implements IWord {
  id: number;
  name: string;
  info: string;

  constructor(name: string, info: string) {
    this.name = name;
    this.info = info;
  }
}

db.words.mapToClass(Word);
