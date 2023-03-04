import { IBook, IParagraph } from '../../../server/db/database';

export interface Action {
  type: string;
  payload: any;
}

export interface ReaderState {
  bookLoaded: boolean;
  currentBookId: number;
  currentBook: IBook;
  paragraph: IParagraph;
  cursor: number;
  history: number[];
  shortcutsModalVisible: boolean;
  spanCursor: number; 
  editing: boolean;
  filter: boolean;
}

export interface CommentsState {
  allowComment: boolean;
}

export interface SearchState {
  searchBoxVisible: boolean;
}
