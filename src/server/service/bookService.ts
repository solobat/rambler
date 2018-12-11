import { db } from '../db/database'
import Book from '../model/Book'

export function queryByFile(file: File) {
    return db.books.get({
        name: file.name,
        size: file.size
    });
}

export function save(file: File, paragraphCount: number) {
    const book: Book = new Book(file.name, file.size, paragraphCount);

    return db.books.put(book);
}

export function selectOne(id: number) {
    return db.books.get(id);
}

export function getAll() {
    return db.books.toArray();
}

export function deleteBook(bookId: number) {
    return db.books.delete(bookId);
}