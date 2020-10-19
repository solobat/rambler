import { IBook, IParagraph } from '../server/db/database';

export interface ReducerState {
  currentBookId: number;
  currentBook: IBook;
  paragraph: IParagraph;
  searchBoxVisible: boolean;
  allowComment: boolean;
  cursor: number;
  history: number[];
}

export interface KEYCODE {
  [propName: string]: string[];
}
