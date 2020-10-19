import { IComment, db } from '../db/database';

export default class Comment implements IComment {
  id: number;
  bookId: number;
  paragraphId: number;
  text: string;
  createTime: number;

  constructor(bookId: number, paragraphId: number, text: string, createTime?: number, id?: number) {
    this.bookId = bookId;
    this.paragraphId = paragraphId;
    this.text = text;

    if (createTime) {
      this.createTime = createTime;
    } else {
      this.createTime = Number(new Date());
    }

    if (id) {
      this.id = id;
    }
  }
}

db.comments.mapToClass(Comment);
