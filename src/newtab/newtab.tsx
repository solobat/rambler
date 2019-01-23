import * as React from 'react';
import './newtab.scss';
import Upload from 'rc-upload';
import * as bookController from '../server/controller/bookController';
import * as paragraphController from '../server/controller/paragraphController';
import * as commentController from '../server/controller/commentController';
import { sliceFileToParagraphs } from '../util/file';
import { IBook, IParagraph, IComment } from '../server/db/database';
import * as Code from '../server/common/code';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import { SOLID_COLORS } from '../common/constant';
import * as reactComposition from 'react-composition';
import { BookMode } from '../server/enum/Book';
import * as browser from 'webextension-polyfill';
import { getRandomIndex } from '../util/common';
import { getValidNetworks, Network, generateUrl, NetworkOption } from '../common/socialShare';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface AppProps {}

interface AppState {
    currentBook: IBook,
    currentBookId: number,
    currentBg: string,
    paragraph: IParagraph,
    commentText: string,
    comments: IComment[],
    networks: Network[],
    selectedText: string,
    locked: boolean
}

declare global {
    interface Window { ramblerApi: any; }
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
        currentBg: window.localStorage.getItem('wallpaper') || '#5b7e91',
        paragraph: null,
        commentText: '',
        comments: [],
        networks: getValidNetworks(),
        selectedText: '',
        locked: false
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

    commentIptRef = null

    constructor(props: AppProps, state: AppState) {
        super(props, state);
        this.commentIptRef = React.createRef();
    }

    loadBook(bookId) {
        if (bookId) {
            bookController.info(bookId).then(resp => {
                if (resp.code === Code.OK.code) {
                    const book: IBook = resp.data;
                    let cursor: number;

                    if (book.mode === BookMode.INORDER) {
                        cursor = book.cursor || 0;
                    } else {
                        cursor = getRandomIndex(book.paragraphCount);
                    }

                    this.setState({
                        currentBook: book,
                        currentBookId: bookId
                    });
                    this.loadParagraphByIndex(cursor, false);
                } else {
                    toast.error(resp.message);
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

    recordCursor(newCursor: number) {
        bookController.updateBook(this.state.currentBookId, {
            cursor: newCursor
        }).then(resp => {
            console.log(resp);
        });
    }

    loadParagraphByIndex(index: number, shouldRecord: boolean) {
        const fixedIndex = this.getFixedParagraphIndex(index);

        if (shouldRecord && this.state.currentBook.mode === BookMode.INORDER) {
            this.recordCursor(fixedIndex);
        }

        paragraphController.queryByIndex(this.state.currentBookId, fixedIndex).then(resp => {
            if (resp.code === Code.OK.code) {
                this.setState({
                    paragraph: resp.data
                });
                this.loadComments();
            } else {
                toast.error(resp.message);
            }
        });
    }

    showPrevParagraph(toHead: boolean) {
        if (toHead) {
            this.loadParagraphByIndex(0, true);
        } else {
            this.loadParagraphByIndex(this.state.paragraph.index - 1, true); 
        }
    }

    showNextParagraph(toTail: boolean) {
        if (toTail) {
            this.loadParagraphByIndex(this.state.currentBook.paragraphCount - 1, true);
        } else {
            this.loadParagraphByIndex(this.state.paragraph.index + 1, true); 
        }
    }

    loadComments() {
        commentController.queryByParagraph(this.state.currentBookId,
            this.state.paragraph.id).then(resp => {
            if (resp.code === Code.OK.code) {
                if (resp.data) {
                    this.setState({
                        comments: resp.data
                    });
                }
            } else {
                toast.error(resp.message);
            }
        });
    }

    isKeyValid(target) {
        if (target.closest('.comment-container')) {
            return false;
        } else {
            return true;
        }
    }

    handleKeyDown(event) {
        const keyCode = event.keyCode;

        if (this.isKeyValid(event.target)) {
            if (KEY_CODE.REFRESH.indexOf(keyCode) !== -1) {
                this.loadBook(this.state.currentBookId);
            } else if (KEY_CODE.PREV.indexOf(keyCode) !== -1) {
                this.showPrevParagraph(event.metaKey);
            } else if (KEY_CODE.NEXT.indexOf(keyCode) !== -1) {
                this.showNextParagraph(event.metaKey);
            }
        }
    }

    componentDidMount() {
        bookController.getCurrentBook().then(id => {
            this.loadBook(id);
            document.addEventListener("keydown", this.handleKeyDown.bind(this));
        });
    }

    onColorBoxClick(color) {
        window.localStorage.setItem('wallpaper', color);
        this.setState({
            currentBg: color
        });
        window.ramblerApi.initTheme();
    }

    onCommentBoxMouseEnter() {
        this.commentIptRef.current.focus();
    }

    onCommentBoxMouseLeave() {
        this.commentIptRef.current.blur();
    }

    onCommentChange(event) {
        const value = event.target.value;

        this.setState({ commentText: value });
    }

    onCommentInputKeyPress(event) {
        if (event.key === 'Enter') {
            const trimedCommentText = this.state.commentText.trim();

            if (trimedCommentText) {
                commentController.saveComment(trimedCommentText, 
                    this.state.currentBookId, this.state.paragraph.id).then(resp => {
                        if (resp.code === Code.OK.code) {
                            console.log('save successfully');
                        } else {
                            toast.error(resp.message);
                        }
                    });
                this.setState({
                    commentText: ''
                });
                this.loadComments();
            }
        }
    }

    getPureBookName(fix: boolean) {
        let fixedName: string;
        
        if (fix) {
           fixedName = this.state.currentBook.name.replace(/[《》]/g, '');
        } else {
            fixedName = this.state.currentBook.name;
        }

        const arr = fixedName.split('.');

        if (arr.length > 1) {
            arr.pop();

            return arr.join('.');
        } else {
            return arr[0];
        }
    }

    getToShareText() {
        if (this.state.selectedText) {
            return this.state.selectedText;
        } else {
            return this.state.paragraph.text;
        }
    }

    onShareHover() {
        const selection = window.getSelection();

        if (selection && selection.toString()) {
            this.setState({
                selectedText: selection.toString()
            });
        } else {
            this.setState({ selectedText: '' });
        }
    }

    onShareClick(network: Network) {
        const config: NetworkOption = {
            title: `${this.getToShareText()} #${this.getPureBookName(true)}#`
        };
        const url: string = generateUrl(network.url, config);

        browser.tabs.create({
            url
        });
    }

    onSlideChange(newIndex) {
        this.loadParagraphByIndex(newIndex, true);
    }

    onLockClick() {
        const locked = !this.state.locked;

        this.setState({ locked });

        if (locked) {
            window.onbeforeunload = () => {
                return 'locked by rambler';
            };
        } else {
            window.onbeforeunload = null;
        }
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
                <div className="color-selector">
                    <div className="current-color color-box" style={{
                        background: this.state.currentBg
                    }}></div>
                    <div className="color-list">
                        { SOLID_COLORS.map((color, index) => {
                            return (
                                <div className="color-box" style={{
                                    background: color
                                }} key={index} onClick={() => this.onColorBoxClick(color)}></div>
                            )
                        }) }
                    </div>
                </div>
                { this.state.paragraph && (
                    <div className="paragraph-container">
                        <div className="process">
                            <Slider defaultValue={this.state.paragraph.index}
                                min={0} max={this.state.currentBook.paragraphCount}
                                onAfterChange={this.onSlideChange.bind(this)}
                                railStyle={{
                                    height: '2px',
                                    borderRadius: '0'
                                }}
                                trackStyle={{
                                    height:'2px',
                                    borderRadius: '0'
                                }}
                                handleStyle={{
                                    borderRadius: '0'
                                }}/>
                        </div>
                        <p className="paragraph-text">{ this.state.paragraph ? this.state.paragraph.text : '' }</p>
                        <p className="book-name">{ this.state.currentBook ? `-- ${this.getPureBookName(false)}` : '' }</p>
                        <div className="share-icons">
                            { this.state.networks.map((network, index) => {
                                const className: string = ['icon-share', `icon-share-${network.className}`].join(' ');

                                return (
                                    <i className={className} key={index}
                                        onMouseEnter={() => this.onShareHover()}
                                        onClick={() => this.onShareClick(network)}></i>
                                )
                            }) }
                        </div>
                    </div>
                )}
                { this.state.paragraph && (
                    <div className="comment-container"
                        onMouseEnter={() => this.onCommentBoxMouseEnter()}
                        onMouseLeave={() => this.onCommentBoxMouseLeave()}>
                        <div className="comment-input-box">
                            <input type="text" value={this.state.commentText}
                                ref={this.commentIptRef}
                                {...reactComposition({
                                    onChange: this.onCommentChange.bind(this)})}
                                onKeyPress={(event) => this.onCommentInputKeyPress(event)}/>
                        </div>
                        <div className="comments">
                            { this.state.comments.map((comment, index) => {
                                return (
                                    <div className="comment-item" key={index}>{ comment.text }</div>
                                )
                            }) }
                        </div>
                    </div>
                ) }
                <ToastContainer autoClose={3000} hideProgressBar={true}/>
                <div className="lock-btn" onClick={() => this.onLockClick()}>
                    { this.state.locked ? <i className="locked" /> : <i className="unlock" /> }
                </div>
            </div>
        )
    }
}
