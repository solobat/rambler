import { IBook, IParagraph } from "../../server/db/database";
import * as bookController from "../../server/controller/bookController";
import { KEYCODE } from "./types";
import * as Code from "../../server/common/code";
import { BookMode } from "../../server/enum/Book";
import { getRandomIndex } from "../../util/common";
import * as paragraphController from "../../server/controller/paragraphController";
import { SESSION_STORAGE } from "@src/common/constant";
import { BookFilterFunc } from "@src/util/book";
import useReaderStore from "./store/modules/reader";
import useSearchStore from "./store/modules/search";

function isKeyValid(target) {
  if (
    target.closest(".comment-container") ||
    target.closest(".color-selector")
  ) {
    return false;
  } else {
    return true;
  }
}
const CURSOR_STORAGE_KEY = "cursors";

const KEY_CODE = {
  REFRESH: ["r"],
  PREV: ["ArrowLeft", "ArrowUp", "h"],
  NEXT: ["ArrowRight", "ArrowDown", "l"],
  OPEN_SEARCH_BOX: ["f"],
  CLOSE_SEARCH_BOX: ["Escape"],
  Edit: ["i", "a"],
  PREV_SPAN: ["k"],
  NEXT_SPAN: ["j"],
  BACK: ["u"],
  FORWARD: ["n"],
};

function getPrevParagraphIndex(paragraph: IParagraph, toHead: boolean) {
  if (toHead) {
    return 0;
  } else {
    return paragraph.index - 1;
  }
}

function getNextParagraphIndex(
  paragraph: IParagraph,
  book: IBook,
  toTail: boolean
) {
  if (toTail) {
    return book.paragraphCount - 1;
  } else {
    return paragraph.index + 1;
  }
}

export function setBgColor(color) {
  window.localStorage.setItem("wallpaper", color);
  window.ramblerApi.initTheme();
}

export type NewtabMode = "read" | "setting";

export function getMode(): NewtabMode {
  return (window.localStorage.getItem("mode") || "read") as NewtabMode;
}

export function setMode(mode: NewtabMode) {
  window.localStorage.setItem("mode", mode);
  window.ramblerApi.updateMode();
}

export function getPureBookName(fix: boolean, currentBook: IBook) {
  let fixedName: string;

  if (fix) {
    fixedName = currentBook.name.replace(/[《》]/g, "");
  } else {
    fixedName = currentBook.name;
  }

  const arr = fixedName.split(".");

  if (arr.length > 1) {
    arr.pop();

    return arr.join(".");
  } else {
    return arr[0];
  }
}

export function keydownEventHandler(
  event: React.KeyboardEvent,
  currentBook: IBook,
  paragraph: IParagraph,
  spanCursor: number,
  setCursor: (cursor: number) => void,
  setEditing: (editing: boolean) => void,
  setSpanCursor: (spanCursor: number) => void,
  setSearchBoxVisible: (visible: boolean) => void
) {
  const key = event.key;

  if (isKeyValid(event.target)) {
    if (KEY_CODE.REFRESH.indexOf(key) !== -1) {
      // 刷新逻辑
    } else if (KEY_CODE.PREV.indexOf(key) !== -1) {
      const index = getPrevParagraphIndex(paragraph, false);
      setCursor(index);
    } else if (KEY_CODE.NEXT.indexOf(key) !== -1) {
      const index = getNextParagraphIndex(paragraph, currentBook, false);
      setCursor(index);
    } else if (KEY_CODE.Edit.indexOf(key) !== -1) {
      event.preventDefault();
      setEditing(true);
    } else if (KEY_CODE.PREV_SPAN.indexOf(key) !== -1) {
      setSpanCursor(spanCursor - 1);
    } else if (KEY_CODE.NEXT_SPAN.indexOf(key) !== -1) {
      setSpanCursor(spanCursor + 1);
    } else if (KEY_CODE.OPEN_SEARCH_BOX.indexOf(key) !== -1) {
      event.preventDefault();
      setSearchBoxVisible(true);
    } else if (KEY_CODE.CLOSE_SEARCH_BOX.indexOf(key) !== -1) {
      setSearchBoxVisible(false);
    } else if (KEY_CODE.BACK.indexOf(key) !== -1) {
      // 后退逻辑
    } else if (KEY_CODE.FORWARD.indexOf(key) !== -1) {
      // 前进逻辑
    }
  }
}

async function getCursors() {
  const res = await chrome.storage.sync.get(CURSOR_STORAGE_KEY);

  return res[CURSOR_STORAGE_KEY] ?? {};
}

export async function getBookCursor(bookId: number) {
  const cursors = await getCursors();

  return cursors[bookId] ?? 0;
}

export async function recordCursor(bookId: number, newCursor: number) {
  const cursors = await getCursors();

  cursors[bookId] = newCursor;

  chrome.storage.sync.set({
    [CURSOR_STORAGE_KEY]: cursors,
  });
}

export function setDefaultBook() {
  bookController.setDefaultBook().then((bid) => {
    window.location.reload();
  });
}

export function getFixedParagraphIndex(
  currentBook: IBook,
  index: number
): number {
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
  uploadTxt: chrome.i18n.getMessage("upload_txt"),
  uploadDone: chrome.i18n.getMessage("upload_ok"),
  commentHere: chrome.i18n.getMessage("comment_here"),
};

export function loadBook(
  bookId: number,
  filter: BookFilterFunc | null,
  setCurrentBook: (book: IBook) => void,
  setBookLoaded: (loaded: boolean) => void,
  setCursor: (cursor: number) => void
) {
  bookController.info(bookId).then(async (resp) => {
    if (resp.code === Code.OK.code) {
      const book: IBook = resp.data;
      let cursor: number;

      if (book.mode === BookMode.INORDER) {
        cursor = await getBookCursor(bookId);
      } else {
        cursor = await resolveBookRandomIndex(
          bookId,
          book.paragraphCount,
          filter
        );
      }

      setCurrentBook(book);
      setCursor(cursor);
      setBookLoaded(true);
    } else {
      console.error(resp.message);
    }
  });
}

async function resolveBookRandomIndex(
  bookId: number,
  total: number,
  filter: BookFilterFunc | null
) {
  if (filter) {
    const res = await paragraphController.getListByBook(bookId);
    const indexArr = res.data.filter(filter).map((item) => item.index);

    return indexArr[getRandomIndex(indexArr.length)];
  } else {
    return getRandomIndex(total);
  }
}

export function loadParagraph(
  currentBook: IBook,
  cursor: number,
  setParagraph: (paragraph: IParagraph) => void
) {
  const fixedIndex = getFixedParagraphIndex(currentBook, cursor);
  const currentBookId = currentBook.id;

  paragraphController.queryByIndex(currentBookId, fixedIndex).then((resp) => {
    if (resp.code === Code.OK.code) {
      setParagraph(resp.data);
      requestAnimationFrame(() => {
        // 滚动逻辑
      });
    } else {
      console.error(resp.message);
    }
  });
}

export function initBook(setCurrentBookId: (id: number) => void) {
  getCurrentBookId().then((id) => {
    if (id) {
      setCurrentBookId(id);
    }
  });
}

function getCurrentBookId() {
  const localId = window.sessionStorage.getItem(
    SESSION_STORAGE.CURRENT_BOOK_ID
  );

  if (localId) {
    return Promise.resolve(Number(localId));
  } else {
    return bookController.getCurrentBook().then((id) => {
      window.sessionStorage.setItem(
        SESSION_STORAGE.CURRENT_BOOK_ID,
        String(id)
      );

      return id;
    });
  }
}
