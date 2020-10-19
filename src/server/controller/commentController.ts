import * as commentService from '../service/commentService';
import * as browser from 'webextension-polyfill';
import { STORAGE_LOCAL } from '../../common/constant';
import Response from '../common/response';
import * as Code from '../common/code';
import { IComment } from '../db/database';

export async function saveComment(text: string, bookId: number, paragraphId: number): Promise<Response<number | null>> {
  const trimedText = text.trim();

  if (trimedText && bookId && paragraphId) {
    const result: number = await commentService.save(text, bookId, paragraphId);

    return Response.ok(result);
  } else {
    return Response.error(Code.PARAMS_ERROR);
  }
}

export async function queryByParagraph(bookId: number, paragraphId: number): Promise<Response<IComment[]> | Response<null>> {
  if (bookId && paragraphId) {
    const result = await commentService.queryByParagraph(bookId, paragraphId);

    return Response.ok(result);
  } else {
    return Response.error(Code.PARAMS_ERROR);
  }
}
