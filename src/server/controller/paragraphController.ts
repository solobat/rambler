import Response from '../common/response';
import * as Code from '../common/code';
import * as paragraphService from '../service/paragraphService';

export function save() {

}

export function bulkSave() {

}

export function queryByBook() {
    
}

export async function queryByIndex(bookId: number, index: number): Promise<Response> {
    if (bookId && typeof index === 'number') {
        const result = await paragraphService.queryByIndex(bookId, index);

        return Response.ok(result);
    } else {
        return Promise.resolve(Response.error(Code.PARAMS_ERROR));
    }
} 