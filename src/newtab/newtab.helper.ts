import { createContext } from 'react';
import { IBook, IParagraph } from "../server/db/database";
import * as bookController from '../server/controller/bookController';
import { KEYCODE, ReducerState } from "./types";
import * as Code from '../server/common/code';
import { BookMode } from "../server/enum/Book";
import { getRandomIndex } from "../util/common";
import { toast } from 'react-toastify';
import * as paragraphController from '../server/controller/paragraphController';
import { Dispatch } from 'redux';
import { SET_CURRENT_BOOK, SET_CURRENT_BOOKID, SET_CURSOR, SET_PARAGRAPH, UPDATE_SEARCHBOX_VISIBLE } from './redux/actionTypes';

function isKeyValid(target) {
  if (target.closest('.comment-container') || target.closest('.color-selector')) {
      return false;
  } else {
      return true;
  }
}

const KEY_CODE: KEYCODE = {
  REFRESH: ['r'],
  PREV: ['left', 'up', 'k'],
  NEXT: ['right', 'down', 'j'],
  OPEN_SEARCH_BOX: ['f'],
  CLOSE_SEARCH_BOX: ['Escape'],
  BACK: ['b'],
  FORWARD: ['n']
}

function getPrevParagraphIndex(paragraph: IParagraph, toHead: boolean) {
  if (toHead) {
      return 0
  } else {
      return paragraph.index - 1;
  }
}

function getNextParagraphIndex(paragraph: IParagraph, book: IBook, toTail: boolean) {
  if (toTail) {
      return book.paragraphCount - 1;
  } else {
      return paragraph.index + 1;
  }
}

export function setBgColor(color) {
  window.localStorage.setItem('wallpaper', color);
  window.ramblerApi.initTheme();
}

export function getPureBookName(fix: boolean, currentBook: IBook) {
  let fixedName: string;
      
  if (fix) {
      fixedName = currentBook.name.replace(/[《》]/g, '');
  } else {
      fixedName = currentBook.name;
  }

  const arr = fixedName.split('.');

  if (arr.length > 1) {
      arr.pop();

      return arr.join('.');
  } else {
      return arr[0];
  }
}

export function keydownEventHandler(event: React.KeyboardEvent, dispatch, currentBook: IBook, paragraph: IParagraph) {
  const key = event.key;

  if (isKeyValid(event.target)) {
      if (KEY_CODE.REFRESH.indexOf(key) !== -1) {
          // this.loadBook(this.state.currentBookId);
      } else if (KEY_CODE.PREV.indexOf(key) !== -1) {
          const index = getPrevParagraphIndex(paragraph, false);

          dispatch({ type: SET_CURSOR, payload: index });
      } else if (KEY_CODE.NEXT.indexOf(key) !== -1) {
          const index = getNextParagraphIndex(paragraph, currentBook, false);

          dispatch({ type: SET_CURSOR, payload: index });
      } else if (KEY_CODE.OPEN_SEARCH_BOX.indexOf(key) !== -1) {
          event.preventDefault();
          dispatch({ type: UPDATE_SEARCHBOX_VISIBLE, payload: true});
      } else if (KEY_CODE.CLOSE_SEARCH_BOX.indexOf(key) !== -1) {
          dispatch({ type: UPDATE_SEARCHBOX_VISIBLE, payload: false});
      } else if (KEY_CODE.BACK.indexOf(key) !== -1) {
          // this.goback();

      } else if (KEY_CODE.FORWARD.indexOf(key) !== -1) {
          // this.goforward();
      }
  }
}

export function recordCursor(bookId: number, newCursor: number) {
  bookController.updateBook(bookId, {
      cursor: newCursor
  }).then(resp => {
    //   console.log(resp);
  });
}

export function setDefaultBook() {
  bookController.setDefaultBook().then(bid => {
      window.location.reload()
  })
}

export function getFixedParagraphIndex(currentBook: IBook, index: number): number {
    let fixedIndex = index;
    const count = currentBook.paragraphCount;

    if (index < 0) {
        fixedIndex = count - 1;
    } else if (index >= count) {
        fixedIndex = 0;
    }

    return fixedIndex;
}

export const i18nMsg = {
  uploadTxt: chrome.i18n.getMessage('upload_txt'),
  uploadDone: chrome.i18n.getMessage('upload_ok'),
  commentHere: chrome.i18n.getMessage('comment_here'),
}

export function loadBook(dispatch: Dispatch, bookId: number) {
  bookController.info(bookId).then(resp => {
    if (resp.code === Code.OK.code) {
        const book: IBook = resp.data;
        let cursor: number;

        if (book.mode === BookMode.INORDER) {
            cursor = book.cursor || 0;
        } else {
            cursor = getRandomIndex(book.paragraphCount);
        }

        dispatch({
            type: SET_CURRENT_BOOK,
            payload: book
        });
        dispatch({
          type: SET_CURSOR,
          payload: cursor
        })
    } else {
        toast.error(resp.message);
    }
  });
}

export function loadParagraph(dispatch: React.Dispatch<any>, currentBook: IBook, cursor: number) {
  const fixedIndex = getFixedParagraphIndex(currentBook, cursor);
  const currentBookId = currentBook.id;

  if (currentBook.mode === BookMode.INORDER) {
      bookController.updateBook(currentBookId, {
          cursor: fixedIndex
      }).then(resp => {
        //   console.log(resp);
      });
  }

  paragraphController.queryByIndex(currentBookId, fixedIndex).then(resp => {
      if (resp.code === Code.OK.code) {
          dispatch({
              type: SET_PARAGRAPH,
              payload: resp.data
          });
          requestAnimationFrame(() => {
              // this.paragraphRef.current.scrollTo(0, 0);
          });
      } else {
          toast.error(resp.message);
      }
  });
}

export function initBook(dispatch:  React.Dispatch<any>) {
  bookController.getCurrentBook().then(id => {
    if (id) {
        dispatch({ type: SET_CURRENT_BOOKID, payload: id });
    } else {
        setDefaultBook();
    }
  });
}