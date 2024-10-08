import { ParagraphData } from "@src/util/paragraph";
import { db } from "../db/database";
import Paragraph from "../model/Paragraph";

export function save(
  bookId: number,
  text: string,
  index: number,
  type = "content"
) {
  const paragraph: Paragraph = new Paragraph(text, index, bookId, type);

  return db.paragraphs.put(paragraph);
}

export function bulkSave(bookId: number, items: ParagraphData[]) {
  const paragraphs = items.map((item, index) => {
    return new Paragraph(item.text, index, bookId, item.type);
  });

  return db.paragraphs.bulkPut(paragraphs);
}

export function queryByIndex(bookId: number, index: number) {
  return db.paragraphs.get({
    bookId,
    index,
  });
}

export function queryByBook(bookId: number) {
  return db.paragraphs
    .where({
      bookId,
    })
    .toArray();
}

export function update(key, changes) {
  return db.paragraphs.update(key, changes);
}

export function search(bookId: number, text: string) {
  return db.paragraphs
    .where({ bookId })
    .filter((paragraph) => {
      return paragraph.text.indexOf(text) !== -1;
    })
    .toArray();
}

export function deleteByBookId(bookId: number) {
  return db.paragraphs.where("bookId").equals(bookId).delete();
}

export function getAll() {
  return db.paragraphs.toArray();
}
