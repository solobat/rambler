import { IBook, db } from '../db/database'

export default class Book implements IBook {
    id: number;
    name: string; 
    size: number;
    createTime: number;
    paragraphCount: number;

    constructor(name: string, size: number, paragraphCount: number, createTime?: number, id?: number) {
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
    }
}

db.books.mapToClass(Book);