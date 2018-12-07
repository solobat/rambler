import * as React from 'react';
import './newtab.scss';
import Upload from 'rc-upload';
import * as bookController from '../server/controller/bookController';
import * as paragraphController from '../server/controller/paragraphController';
import { sliceFileToParagraphs } from '../util/file';
import * as browser from 'webextension-polyfill';
import { STORAGE_LOCAL } from '../common/constant';
import { IBook, IParagraph } from '../server/db/database';
import * as Code from '../server/common/code';

interface AppProps {}

interface AppState {
    currentBook: IBook,
    paragraph: IParagraph
}

const style = `
        .rc-upload-disabled {
           opacity:0.5;
        `;

const uploaderProps = {
    accept: 'text/plain',
    beforeUpload(file) {
      sliceFileToParagraphs(file).then((resp: string[]) => {
        bookController.saveBook(file, resp).then(resp => {
            if (resp.code === 0) {
                browser.storage.local.set({ [STORAGE_LOCAL.CURRENT_BOOK_ID]: resp.data });
                alert('upload done!');
            } else {
                alert(resp.message);
            }
        });
      });
      
      return false;
    },
    onStart: (file) => {
      console.log('onStart', file.name);
    },
    onSuccess(file) {
      console.log('onSuccess', file);
    },
    onProgress(step, file) {
      console.log('onProgress', Math.round(step.percent), file.name);
    },
    onError(err) {
      console.log('onError', err);
    }
}

export default class NewTab extends React.Component<AppProps, AppState> {
    state = {
        currentBook: null,
        paragraph: null
    }

    constructor(props: AppProps, state: AppState) {
        super(props, state);
    }

    componentDidMount() {
        browser.storage.local.get(STORAGE_LOCAL.CURRENT_BOOK_ID).then(resp => {
            const bookId: number = resp[STORAGE_LOCAL.CURRENT_BOOK_ID];

            bookController.getRandomParagraph(bookId).then(resp => {
                if (resp.code === Code.OK.code) {
                    this.setState({
                        currentBook: resp.data.book,
                        paragraph: resp.data.paragraph
                    });
                }
            });
        });
    }

    render() {
        return (
            <div className="newtab-container">
                <style>
                    {style}
                </style>
                <Upload {...uploaderProps} className="file-uploader">
                    <a>上传txt文件</a>
                </Upload>
                <div className="paragrap-container">
                    { this.state.paragraph ? this.state.paragraph.text : '' }
                </div>
            </div>
        )
    }
}
