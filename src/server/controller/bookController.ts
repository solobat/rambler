import * as bookService from '../service/bookService';
import * as paragraphService from '../service/paragraphService';
import { STORAGE_LOCAL } from '../../common/constant';
import Response from '../common/response';
import * as Code from '../common/code';
import { IBook, IParagraph, db } from '../db/database';
import TheFirstAndLastFreedom from '../../assets/text/The-first-and-last-freedom';
import { BookMode } from '../enum/Book';

export async function saveBook(file: File, paragraphs: string[]): Promise<Response<number> | Response<null>> {
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

export async function setDefaultBook() {
  const bid = await bookService.saveDefault();

  if (bid) {
    await paragraphService.bulkSave(bid, TheFirstAndLastFreedom);
    await chrome.storage.sync.set({
      [STORAGE_LOCAL.CURRENT_BOOK_ID]: bid,
    });
  }
  return Response.ok(bid);
}

export async function info(id: number): Promise<Response<IBook> | Response<null>> {
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

export async function deleteBook(bookId: number): Promise<Response<boolean> | Response<null>> {
  if (bookId) {
    await bookService.deleteBook(bookId);
    await paragraphService.deleteByBookId(bookId);

    return Response.ok(true);
  } else {
    return Response.error(Code.PARAMS_ERROR);
  }
}

export async function updateBook(bookId: number, changes: object): Promise<Response<number> | Response<null>> {
  if (bookId) {
    const result = await bookService.update(bookId, changes);

    return Response.ok(result);
  } else {
    return Response.error(Code.PARAMS_ERROR);
  }
}

export async function getList(all = false): Promise<Response<IBook[]>> {
  let result = await bookService.getAll();
  
  if (!all) {
    result = result.filter(item => item.mode !== BookMode.ARCHIVED)
  }

  return Response.ok(result);
}

export function setCurrentBook(bookId: number) {
  return chrome.storage.sync.set({
    [STORAGE_LOCAL.CURRENT_BOOK_ID]: bookId,
  });
}

export function getCurrentBook(): Promise<number> {
  return chrome.storage.sync.get(STORAGE_LOCAL.CURRENT_BOOK_ID).then((resp) => {
    return resp[STORAGE_LOCAL.CURRENT_BOOK_ID];
  });
}
