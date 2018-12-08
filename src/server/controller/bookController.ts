import * as bookService from '../service/bookService';
import * as paragraphService from '../service/paragraphService';
import Response from '../common/response';
import * as Code from '../common/code';
import { IBook, IParagraph } from '../db/database';
import { getRandomIndex } from '../../util/common';

export async function saveBook(file: File, paragraphs: string[]): Promise<Response> {
    if (file && paragraphs && paragraphs.length > 0) {
        const book = await bookService.queryByFile(file);

        if (!book) {
            const result: number = await bookService.save(file, paragraphs.length);

            if (result) {
                await paragraphService.bulkSave(result, paragraphs);
            }

            return Response.ok(result);
        } else {
            return Response.error(Code.EXISTS);
        }
    } else {
        return Response.error(Code.PARAMS_ERROR);
    }
}

export async function info(id: number): Promise<Response> {
    if (id) {
        const result = await bookService.selectOne(id);

        if (result) {
            return Response.ok(result);
        } else {
            return Response.error(Code.NOT_EXISTS);
        }
    } else {
        return Response.error(Code.PARAMS_ERROR);
    }
}

export async function getRandomParagraph(bookId: number): Promise<Response> {
    if (bookId) {
        const book: IBook = await bookService.selectOne(bookId);

        if (book) {
            const paragraph: IParagraph = await paragraphService.queryByIndex(bookId, 
                getRandomIndex(book.paragraphCount));

            if (paragraph) {
                return Response.ok({
                    book,
                    paragraph
                });
            } else {
                return Response.error(Code.NOT_EXISTS);
            }
        } else {
            return Response.error(Code.NOT_EXISTS);
        }
    } else {
        return Response.error(Code.PARAMS_ERROR);
    }
}

export function deleteBook() {

}

export function updateBook() {

}

export async function getList() {
    const result = await bookService.getAll();

    return Response.ok(result);
}