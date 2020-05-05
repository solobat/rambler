import { db } from '../db/database'
import Book from '../model/Book'
import TheFirstAndLastFreedom from '../../assets/text/The-first-and-last-freedom';

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

export function saveDefault() {
    const book: Book = new Book('The first and last freedom', 233, TheFirstAndLastFreedom.length)

    return db.books.put(book);
}

export function selectOne(id: number) {
    return db.books.get(id);
}

export function getAll() {
    return db.books.toArray();
}

export function update(key, changes) {
    return db.books.update(key, changes);
}

export function deleteBook(bookId: number) {
    return db.books.delete(bookId);
}