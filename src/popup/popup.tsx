import * as React from 'react';
import './Popup.scss';
import { IBook } from '../server/db/database';
import * as bookController from '../server/controller/bookController';
import * as Code from '../server/common/code';

interface AppProps {}

interface AppState {
    currentBookId: number,
    bookList: IBook[]
}

export default class Popup extends React.Component<AppProps, AppState> {
    state = {
        currentBookId: 0,
        bookList: []    
    }

    constructor(props: AppProps, state: AppState) {
        super(props, state);
    }

    loadBook(bookId) {
        bookController.getList().then(resp => {
            if (resp.code === Code.OK.code) {
                this.setState({
                    currentBookId: bookId,
                    bookList: resp.data
                });
            }
        });
    }

    componentDidMount() {
        bookController.getCurrentBook().then(id => {
            this.loadBook(id);
        });
    }

    onBookClick(book) {
        this.setState({
            currentBookId: book.id
        });
        bookController.setCurrentBook(book.id).then(() => {
            console.log('save successfully!');
        });
    }

    render() {
        return (
            <div className="popupContainer">
                <BookList currentId={this.state.currentBookId}
                    list={this.state.bookList} onBookClick={this.onBookClick.bind(this)}></BookList>
            </div>
        )
    }
}


interface BookListProps {
    list: IBook[],
    currentId: number,
    onBookClick: Function
}

class BookList extends React.Component<BookListProps> {
    render() {
        return (
            <div className="book-list">
                { this.props.list.map((book, index) => {
                    const className = ['book-item',
                        book.id === this.props.currentId ? 'selected' : ''].join(' ');
                    return (
                        <div className={className} key={index}
                            onClick={() => this.props.onBookClick(book)}>
                            { book.name.split('.')[0] }
                        </div>
                    )
                }) }
            </div>
        );
    }
}
