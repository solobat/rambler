import * as React from 'react';
import './newtab.scss';
import Upload from 'rc-upload';
import * as bookController from '../server/controller/bookController';
import { sliceFileToParagraphs } from '../util/file';
import { IBook, IParagraph } from '../server/db/database';
import * as Code from '../server/common/code';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import { number } from 'prop-types';

interface AppProps {}

interface AppState {
    currentBook: IBook,
    currentBookId: number,
    paragraph: IParagraph
}

const style = `
        .rc-upload-disabled {
           opacity:0.5;
        }
        `;

const i18nMsg = {
    uploadTxt: chrome.i18n.getMessage('upload_txt'),
    uploadDone: chrome.i18n.getMessage('upload_ok')
}

const REFRESH_KEY = 'r';

export default class NewTab extends React.Component<AppProps, AppState> {
    state = {
        currentBook: null,
        currentBookId: 0,
        paragraph: null
    }

    uploaderProps = {
        accept: 'text/plain',
        parent: this,
        beforeUpload(file) {
          sliceFileToParagraphs(file).then((resp: string[]) => {
            bookController.saveBook(file, resp).then(resp => {
                if (resp.code === 0) {
                    const bookId: number = resp.data;

                    bookController.setCurrentBook(bookId);
                    this.parent.loadBook(bookId);

                    toast.success(i18nMsg.uploadDone);
                } else {
                    toast.error(resp.message);
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

    constructor(props: AppProps, state: AppState) {
        super(props, state);
    }

    loadBook(bookId) {
        if (bookId) {
            bookController.getRandomParagraph(bookId).then(resp => {
                if (resp.code === Code.OK.code) {
                    this.setState({
                        currentBookId: bookId,
                        currentBook: resp.data.book,
                        paragraph: resp.data.paragraph
                    });
                }
            });
        }
    }

    handleKeyDown(event) {
        if (event.key === REFRESH_KEY) {
            this.loadBook(this.state.currentBookId);
        }
    }

    componentDidMount() {
        bookController.getCurrentBook().then(id => {
            this.loadBook(id);
            document.addEventListener("keydown", this.handleKeyDown.bind(this));
        });
    }

    render() {
        return (
            <div className="newtab-container">
                <style>
                    {style}
                </style>
                <Upload {...this.uploaderProps} className="file-uploader">
                    <a>{i18nMsg.uploadTxt}</a>
                </Upload>
                <div className="paragrap-container">
                    <p>{ this.state.paragraph ? this.state.paragraph.text : '' }</p>
                    <p className="book-name">{ this.state.currentBook ? `-- ${this.state.currentBook.name.split('.')[0]}` : '' }</p>
                </div>
                <ToastContainer autoClose={3000} hideProgressBar={true}/>
            </div>
        )
    }
}
