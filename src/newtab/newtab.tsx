import * as React from 'react';
import './newtab.scss';
import Upload from 'rc-upload';
import * as bookController from '../server/controller/bookController';
import { sliceFileToParagraphs } from '../util/file';
import { IBook, IParagraph } from '../server/db/database';
import * as Code from '../server/common/code';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

interface AppProps {}

interface AppState {
    currentBook: IBook,
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

export default class NewTab extends React.Component<AppProps, AppState> {
    state = {
        currentBook: null,
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
        bookController.getRandomParagraph(bookId).then(resp => {
            if (resp.code === Code.OK.code) {
                this.setState({
                    currentBook: resp.data.book,
                    paragraph: resp.data.paragraph
                });
            }
        });
    }

    componentDidMount() {
        bookController.getCurrentBook().then(id => {
            this.loadBook(id);
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
                    { this.state.paragraph ? this.state.paragraph.text : '' }
                </div>
                <ToastContainer autoClose={3000} hideProgressBar={true}/>
            </div>
        )
    }
}
