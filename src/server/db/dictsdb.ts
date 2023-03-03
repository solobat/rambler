import Dexie from 'dexie';

export class DictsDatabase extends Dexie {
  words: Dexie.Table<IWord, number>;

  constructor() {
    super('DictsDatabase');

    this.version(1).stores({
      words: '++id, name, info',
    });
  }
}

export interface IWord {
  name: string;
  info: string;
}

export var db = new DictsDatabase();
