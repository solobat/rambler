import Response from '../common/response';
import * as Code from '../common/code';
import * as paragraphService from '../service/paragraphService';

export function save() {

}

export function bulkSave() {

}

export function queryByBook() {
    
}

export async function queryByIndex(bookId: number, index: number) {
    if (bookId && typeof index === 'number') {
        const result = await paragraphService.queryByIndex(bookId, index);

        console.log(result);
    } else {
        return Response.error(Code.PARAMS_ERROR);
    }
} 