import Response from '../common/response';
import * as Code from '../common/code';
import * as paragraphService from '../service/paragraphService';
import { IParagraph } from '../db/database';

export function save() {}

export function bulkSave() {}

export function queryByBook() {}

export async function updateText(id, text) {
  if (id && text) {
    const result = await paragraphService.update(id, {
      text
    });

    return Response.ok(result);
  } else {
    return Response.error(Code.PARAMS_ERROR);
  }
}

export async function getListByBook(bookId: number): Promise<Response<IParagraph[]>> {
  let result = await paragraphService.queryByBook(bookId);
  
  return Response.ok(result);
}

export async function getChapters(bookId: number): Promise<Response<IParagraph[]>> {
  let result = (await paragraphService.queryByBook(bookId)).filter(p => p.type === 'chapter');
  
  return Response.ok(result);
}

export async function queryByIndex(bookId: number, index: number): Promise<Response<IParagraph> | Response<null>> {
  if (bookId && typeof index === 'number') {
    const result = await paragraphService.queryByIndex(bookId, index);

    return Response.ok(result);
  } else {
    return Promise.resolve(Response.error(Code.PARAMS_ERROR));
  }
}

export async function search(bookId: number, text: string): Promise<Response<IParagraph[]> | Response<null>> {
  if (bookId && text) {
    const result = await paragraphService.search(bookId, text);

    return Response.ok(result);
  } else {
    return Response.error(Code.PARAMS_ERROR);
  }
}
