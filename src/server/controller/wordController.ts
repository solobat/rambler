import * as wordService from '../service/wordService';
import Response from '../common/response';
import * as Code from '../common/code';
import { IWord, db } from '../db/dictsdb';

export async function saveWord(name: string, info: string): Promise<Response<number> | Response<null>> {
  if (name && info) {
    const word = await wordService.queryByName(name);

    if (!word) {
      const result: number = await wordService.save(name, info);

      return Response.ok(result);
    } else {
      return Response.error(Code.EXISTS);
    }
  } else {
    return Response.error(Code.PARAMS_ERROR);
  }
}

export async function info(name: string): Promise<Response<IWord> | Response<null>> {
  if (name) {
    const result = await wordService.queryByName(name);

    if (result) {
      return Response.ok(result);
    } else {
      return Response.error(Code.NOT_EXISTS);
    }
  } else {
    return Response.error(Code.PARAMS_ERROR);
  }
}

export async function deleteWord(wordId: number): Promise<Response<boolean> | Response<null>> {
  if (wordId) {
    await wordService.deleteBook(wordId);

    return Response.ok(true);
  } else {
    return Response.error(Code.PARAMS_ERROR);
  }
}

export async function updateWord(wordId: number, changes: object): Promise<Response<number> | Response<null>> {
  if (wordId) {
    const result = await wordService.update(wordId, changes);

    return Response.ok(result);
  } else {
    return Response.error(Code.PARAMS_ERROR);
  }
}
