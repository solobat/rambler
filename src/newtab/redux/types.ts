import { IBook, IParagraph } from "../../server/db/database";

export interface Action {
  type: string;
  payload: any;
};

export interface ReaderState {
  currentBookId: number;
  currentBook: IBook;
  paragraph: IParagraph;
  cursor: number;
  history: number[];
}

export interface CommentsState {
  allowComment: boolean;
}

export interface SearchState {
  searchBoxVisible: boolean;
}