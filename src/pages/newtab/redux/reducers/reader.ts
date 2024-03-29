import { getBookFilter } from "@src/util/storage";
import { IBook, IParagraph } from "../../../../server/db/database";
import {
  ADD_HISTORY,
  RESET_HISTORY,
  SET_CURRENT_BOOK,
  SET_CURRENT_BOOKID,
  SET_CURSOR,
  SET_PARAGRAPH,
  SET_SHORTCUTS_MODAL_VISIBLE,
  UPDATE_PARAGRAH_TEXT,
  SET_BOOK_LOADED,
  SET_SPAN_CURSOR,
  INC_CURSOR,
  SET_EDITING,
  SET_FILTER,
} from "../actionTypes";
import { Action, ReaderState } from "../types";

const initialState: ReaderState = {
  bookLoaded: false,
  currentBookId: 0,
  editing: false,
  currentBook: null,
  paragraph: null,
  cursor: 0,
  history: [],
  shortcutsModalVisible: false,
  spanCursor: -1,
  filter: getBookFilter()
};

const MAX_HISTORY_LENGTH = 1024;

function addHistory(history: number[], newItem: number): number[] {
  if (history.length >= MAX_HISTORY_LENGTH) {
    history.shift();
  }
  history.push(newItem);

  return [...history];
}

export default function (state = initialState, action: Action) {
  switch (action.type) {
    case SET_CURRENT_BOOKID:
      state.currentBookId = action.payload;
      return { ...state };
    case SET_CURRENT_BOOK:
      state.currentBook = action.payload;
      return { ...state };
    case SET_PARAGRAPH:
      state.paragraph = action.payload;
      return { ...state };
    case SET_CURSOR:
      state.cursor = action.payload;
      state.spanCursor = -1;
      return { ...state };
    case SET_EDITING:
      state.editing = action.payload;
      return { ...state };
    case INC_CURSOR:
      state.cursor += 1;
      state.spanCursor = 0;
      return { ...state };
    case SET_SPAN_CURSOR:
      state.spanCursor = action.payload;
      return { ...state };
    case SET_FILTER:
      state.filter = action.payload;
      return { ...state };
    case RESET_HISTORY:
      state.history = [];
      return { ...state };
    case ADD_HISTORY:
      state.history = addHistory(state.history, action.payload);
      return { ...state };
    case SET_SHORTCUTS_MODAL_VISIBLE:
      state.shortcutsModalVisible = action.payload;
      return { ...state };
    case SET_BOOK_LOADED:
      state.bookLoaded = action.payload;
      return { ...state };
    case UPDATE_PARAGRAH_TEXT:
      state.paragraph = {
        ...state.paragraph,
        text: action.payload,
      };

      return { ...state };
    default:
      return state;
  }
}
