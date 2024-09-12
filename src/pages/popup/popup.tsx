import * as React from "react";
import "./Popup.scss";
import { IBook } from "../../server/db/database";
import * as bookController from "../../server/controller/bookController";
import * as Code from "../../server/common/code";
import Book from "../../server/model/Book";
import { BookMode } from "../../server/enum/Book";
import { onDbUpdate } from "../../helper/db.helper";
import { noticeBg } from "../../helper/event";
import { APP_ACTIONS } from "../../common/constant";

interface AppProps {}

interface AppState {
  currentBookId: number;
  bookList: IBook[];
  showAll: boolean;
}

const newTabUrl = chrome.runtime.getURL("src/pages/newtab/index.html");

export default class Popup extends React.Component<AppProps, AppState> {
  state = {
    currentBookId: 0,
    bookList: [],
    showAll: false,
  };

  constructor(props: AppProps, state: AppState) {
    super(props, state);
  }

  loadBook(bookId) {
    bookController.getList(this.state.showAll).then((resp) => {
      if (resp.code === Code.OK.code) {
        this.setState({
          currentBookId: bookId,
          bookList: resp.data,
        });
      }
    });
  }

  componentDidMount() {
    bookController.getCurrentBook().then((id) => {
      this.loadBook(id);
    });
    onDbUpdate(() => {});
  }

  onShowAllChanged() {
    this.setState(
      {
        showAll: !this.state.showAll,
      },
      () => {
        this.loadBook(this.state.currentBookId);
      }
    );
  }

  onBookClick(book) {
    this.setState({
      currentBookId: book.id,
    });
    bookController.setCurrentBook(book.id).then(() => {
      console.log("save successfully!");
    });
  }

  onBookDblClick(book: IBook) {
    this.onBookClick(book);
    chrome.tabs.create({
      url: "chrome://newtab",
    });
  }

  onBookDeleteClick(event, book: Book) {
    event.stopPropagation();
    event.preventDefault();

    bookController.deleteBook(book.id).then((resp) => {
      this.loadBook(this.state.currentBookId);
    });
  }

  onBookOrderClick(event, book: Book, mode: number) {
    event.stopPropagation();
    event.preventDefault();

    bookController.updateBook(book.id, { mode }).then((resp) => {
      this.loadBook(this.state.currentBookId);
      console.log(resp);
    });
  }

  render() {
    const docsLink = "https://rambler.const.app";

    return (
      <div className="popupContainer">
        <div className="app-title">
          <a className="logo-wrap" href={newTabUrl} target="_blank">
            <i className="icon-app"></i>
            <div className="text">Rambler</div>
          </a>
          <a className="docs-link" href={docsLink} target="_blank">
            <i className="icon-docs"></i>
          </a>
        </div>
        <label className="show-all-wrap" htmlFor="show-all">
          ALL
          <input
            id="show-all"
            type="checkbox"
            checked={this.state.showAll}
            onChange={this.onShowAllChanged.bind(this)}
          />
        </label>
        {this.state.bookList.length ? (
          <BookList
            currentId={this.state.currentBookId}
            list={this.state.bookList}
            onBookClick={this.onBookClick.bind(this)}
            onBookDblClick={this.onBookDblClick.bind(this)}
            onBookDeleteClick={this.onBookDeleteClick.bind(this)}
            onBookOrderClick={this.onBookOrderClick.bind(this)}
          ></BookList>
        ) : (
          <NoData />
        )}
      </div>
    );
  }
}

function NoData() {
  const onClick = () => {
    window.open(newTabUrl);
  };
  return (
    <div className="nodata">
      <div className="msg">No Data</div>
      <button onClick={onClick} className="btn-add">
        + Add Book
      </button>
    </div>
  );
}

interface BookListProps {
  list: IBook[];
  currentId: number;
  onBookClick: Function;
  onBookDeleteClick: Function;
  onBookOrderClick: Function;
  onBookDblClick: (book: IBook) => void;
}

class BookList extends React.Component<BookListProps> {
  render() {
    return (
      <div className="book-list">
        {this.props.list.map((book, index) => {
          const className = [
            "book-item",
            book.id === this.props.currentId ? "selected" : "",
          ].join(" ");
          return (
            <div
              className={className}
              key={index}
              onClick={() => this.props.onBookClick(book)}
              onDoubleClick={() => this.props.onBookDblClick(book)}
            >
              {book.name.split(".")[0]}
              <div className="icons">
                {book.mode === BookMode.INORDER && (
                  <img
                    className="icon icon-order"
                    src="/img/icon/inorder.svg"
                    alt=""
                    onClick={(event) =>
                      this.props.onBookOrderClick(event, book, BookMode.SHUFFLE)
                    }
                  />
                )}
                {book.mode === BookMode.SHUFFLE && (
                  <img
                    className="icon icon-order"
                    src="/img/icon/shuffle.svg"
                    alt=""
                    onClick={(event) =>
                      this.props.onBookOrderClick(event, book, BookMode.INORDER)
                    }
                  />
                )}
                {book.mode !== BookMode.ARCHIVED && (
                  <img
                    className="icon icon-order"
                    src="/img/icon/archived.svg"
                    alt=""
                    onClick={(event) =>
                      this.props.onBookOrderClick(
                        event,
                        book,
                        BookMode.ARCHIVED
                      )
                    }
                  />
                )}
                {book.mode === BookMode.ARCHIVED && (
                  <img
                    className="icon icon-order"
                    src="/img/icon/restore.svg"
                    alt=""
                    onClick={(event) =>
                      this.props.onBookOrderClick(event, book, BookMode.SHUFFLE)
                    }
                  />
                )}
                <img
                  className="icon icon-close"
                  src="/img/icon/delete.svg"
                  alt=""
                  onClick={(event) => this.props.onBookDeleteClick(event, book)}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
