import * as React from 'react';
import './newtab.scss';
import Upload from 'rc-upload';
import * as bookController from '../server/controller/bookController';
import * as paragraphController from '../server/controller/paragraphController';
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

interface KEYCODE {
    [propName: string]: number[]
}

const KEY_CODE: KEYCODE = {
    REFRESH: [82],
    PREV: [37, 38],
    NEXT: [39, 40]
}

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

    getFixedParagraphIndex(index: number): number {
        let fixedIndex = index;
        const count = this.state.currentBook.paragraphCount;

        if (index < 0) {
            fixedIndex = count - 1;
        } else if (index >= count) {
            fixedIndex = 0;
        }

        return fixedIndex;
    }

    loadParagraphByIndex(index) {
        const fixedIndex = this.getFixedParagraphIndex(index);

        paragraphController.queryByIndex(this.state.currentBookId, fixedIndex).then(resp => {
            if (resp.code === Code.OK.code) {
                this.setState({
                    paragraph: resp.data
                });
            } else {
                toast.error(resp.message);
            }
        });
    }

    showPrevParagraph() {
        this.loadParagraphByIndex(this.state.paragraph.index - 1); 
    }

    showNextParagraph() {
        this.loadParagraphByIndex(this.state.paragraph.index + 1); 
    }

    handleKeyDown(event) {
        const keyCode = event.keyCode;

        if (KEY_CODE.REFRESH.indexOf(keyCode) !== -1) {
            this.loadBook(this.state.currentBookId);
        } else if (KEY_CODE.PREV.indexOf(keyCode) !== -1) {
            this.showPrevParagraph();
        } else if (KEY_CODE.NEXT.indexOf(keyCode) !== -1) {
            this.showNextParagraph();
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
