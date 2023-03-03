import { db } from "../db/dictsdb";
import Word from "../model/Word";

export function queryByName(name: string) {
  return db.words.get({
    name,
  });
}

export function save(name: string, info: string) {
  const book: Word = new Word(name, info);

  return db.words.put(book);
}

export function update(key, changes) {
  return db.words.update(key, changes);
}

export function deleteBook(wordId: number) {
  return db.words.delete(wordId);
}
