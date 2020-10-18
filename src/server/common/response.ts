import * as Code from '../common/code';

export default class Response<T> {
    code: number;
    message: string;
    data?: T;

    constructor(codeMsg: Code.CodeMsg) {
        this.code = codeMsg.code;
        this.message = codeMsg.msg;
    }

    static ok<O>(data: O) {
        const instance = new Response<O>(Code.OK);

        instance.data = data;

        return instance;
    }

    static error(codeMsg: Code.CodeMsg) {
        const instance = new Response<null>(codeMsg);

        return instance;
    }
}