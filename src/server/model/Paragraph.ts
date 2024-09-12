import { IParagraph, db } from "../db/database";

export default class Paragraph implements IParagraph {
  id: number;
  bookId: number;
  text: string;
  index: number;
  createTime: number;
  type: string;

  constructor(
    text: string,
    index: number,
    bookId: number,
    type: string,
    createTime?: number,
    id?: number
  ) {
    this.text = text;
    this.index = index;
    this.bookId = bookId;
    this.type = type;
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

db.paragraphs.mapToClass(Paragraph);
