import { IBook, db } from '../db/database'

export class Book implements IBook {
    id: number;
    name: string; 
    size: number;
    createTime: number;

    constructor(name: string, size: number, createTime?: number, id?: number) {
        this.name = name;
        this.size = size;
        if (createTime) {
            this.createTime = createTime;
        } else {
            this.createTime = Number(new Date());
        }

        if (id) {
            this.id = id;
        }
    }

    save() {
        return db.transaction('rw', db.books, db.paragraphs, async() => {
            this.id = await db.books.put(this);
        });
    }
}