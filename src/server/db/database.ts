import Dexie from 'dexie';

export class RamblerDatabase extends Dexie {
    books: Dexie.Table<IBook, number>;
    paragraphs: Dexie.Table<IParagraph, number>;
    comments: Dexie.Table<IComment, number>;

    constructor() {
        super("RamblerDatabase");

        this.version(1).stores({
            books: '++id, name, size, createTime, paragraphCount',
            paragraphs: '++id, bookId, text, index, likeCount',
            comments: '++id, bookId, paragraphId, text, createTime'
        });
    }
}

export interface IBook {
    id?: number,
    name: string,
    size: number,
    paragraphCount: number,
    createTime?: number
}

export interface IParagraph {
    id?: number,
    bookId: number,
    text: string,
    index: number,
    likeCount?: number;
}

export interface IComment {
    id?: number,
    bookId: number,
    paragraphId: number,
    text: string,
    createTime?: number
}

export var db = new RamblerDatabase();
