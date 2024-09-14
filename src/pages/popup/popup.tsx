import * as React from "react";
import { IBook } from "../../server/db/database";
import * as bookController from "../../server/controller/bookController";
import * as Code from "../../server/common/code";
import Book from "../../server/model/Book";
import { BookMode } from "../../server/enum/Book";
import { onDbUpdate } from "../../helper/db.helper";
import "./popup.scss";

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
      <div className="bg-base-100 text-base-content min-h-[100px] w-[300px] p-4">
        <div className="pb-4 border-b border-base-300 flex justify-between items-center">
          <a
            className="flex items-center cursor-pointer no-underline"
            href={newTabUrl}
            target="_blank"
          >
            <i className="w-8 h-8 bg-[url('/img/icon/icon128.png')] bg-no-repeat bg-center bg-[length:30px_30px]"></i>
            <div className="ml-2 text-base text-base-content">Rambler</div>
          </a>
          <div className="tooltip" data-tip="查看文档">
            <a className="docs-link" href={docsLink} target="_blank">
              <DocIcon />
            </a>
          </div>
        </div>
        <label
          className="flex items-center pl-1 cursor-pointer"
          htmlFor="show-all"
        >
          ALL
          <input
            id="show-all"
            type="checkbox"
            className="checkbox checkbox-xs ml-2"
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
    <div className="text-center">
      <div className="mt-4 text-sm">No Data</div>
      <button onClick={onClick} className="btn btn-outline btn-sm mt-4">
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
          const className = `relative py-1 px-4 pr-1 text-sm group cursor-pointer  ${
            book.id === this.props.currentId ? "bg-base-200" : ""
          }`;
          return (
            <div
              className={className}
              key={index}
              onClick={() => this.props.onBookClick(book)}
              onDoubleClick={() => this.props.onBookDblClick(book)}
            >
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                {book.name.split(".")[0]}
              </div>
              <div className="flex bg-inherit absolute z-10 top-1.5 right-0 cursor-pointer">
                {book.mode === BookMode.INORDER && (
                  <div className="tooltip" data-tip="切换到随机模式">
                    <InOrderIcon onClick={(event) => this.props.onBookOrderClick(event, book, BookMode.SHUFFLE)} />
                  </div>
                )}
                {book.mode === BookMode.SHUFFLE && (
                  <div className="tooltip" data-tip="切换到顺序模式">
                    <ShuffleIcon onClick={(event) => this.props.onBookOrderClick(event, book, BookMode.INORDER)} />
                  </div>
                )}
                {book.mode !== BookMode.ARCHIVED && (
                  <div className="tooltip" data-tip="归档">
                    <ArchiveIcon onClick={(event) => this.props.onBookOrderClick(event, book, BookMode.ARCHIVED)} />
                  </div>
                )}
                {book.mode === BookMode.ARCHIVED && (
                  <div className="tooltip" data-tip="恢复">
                    <RestoreIcon onClick={(event) => this.props.onBookOrderClick(event, book, BookMode.INORDER)} />
                  </div>
                )}
                <div className="tooltip" data-tip="删除">
                  <DeleteIcon onClick={(event) => this.props.onBookDeleteClick(event, book)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

const DocIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const InOrderIcon = ({ onClick }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#4a5568"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mx-1 hidden group-hover:block"
    onClick={onClick}
  >
    <line x1="17" y1="10" x2="3" y2="10"></line>
    <line x1="21" y1="6" x2="3" y2="6"></line>
    <line x1="21" y1="14" x2="3" y2="14"></line>
    <line x1="17" y1="18" x2="3" y2="18"></line>
  </svg>
);

const ShuffleIcon = ({ onClick }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#4a5568"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mx-1 hidden group-hover:block"
    onClick={onClick}
  >
    <polyline points="16 3 21 3 21 8"></polyline>
    <line x1="4" y1="20" x2="21" y2="3"></line>
    <polyline points="21 16 21 21 16 21"></polyline>
    <line x1="15" y1="15" x2="21" y2="21"></line>
    <line x1="4" y1="4" x2="9" y2="9"></line>
  </svg>
);

const ArchiveIcon = ({ onClick }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#4a5568"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mx-1 hidden group-hover:block"
    onClick={onClick}
  >
    <polyline points="21 8 21 21 3 21 3 8"></polyline>
    <rect x="1" y="3" width="22" height="5"></rect>
    <line x1="10" y1="12" x2="14" y2="12"></line>
  </svg>
);

const RestoreIcon = ({ onClick }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#4a5568"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mx-1 hidden group-hover:block"
    onClick={onClick}
  >
    <polyline points="1 4 1 10 7 10"></polyline>
    <polyline points="23 20 23 14 17 14"></polyline>
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
  </svg>
);

const DeleteIcon = ({ onClick }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#e53e3e"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mx-1 hidden group-hover:block"
    onClick={onClick}
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);
