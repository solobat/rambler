import { IBook, db } from '../db/database'
import { BookMode } from '../enum/Book'

export default class Book implements IBook {
    id: number;
    name: string; 
    size: number;
    createTime: number;
    paragraphCount: number;
    cursor: number;
    mode?: number;

    constructor(name: string, size: number, paragraphCount: number, createTime?: number, id?: number, mode?: number, cursor?: number) {
        this.name = name;
        this.size = size;
        this.paragraphCount = paragraphCount;
        
        if (createTime) {
            this.createTime = createTime;
        } else {
            this.createTime = Number(new Date());
        }

        if (id) {
            this.id = id;
        }

        if (cursor) {
            this.cursor = cursor;
        } else {
            this.cursor = 0;
        }

        if (mode) {
            this.mode = mode;
        } else {
            this.mode = BookMode.SHUFFLE;
        }
    }
}

db.books.mapToClass(Book);