import * as React from "react";
import { useCallback, useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./redux/store";
import { useEventListener } from "ahooks";

import { onDbUpdate } from "../../helper/db.helper";

import TxtUpload from "./components/TxtUpload";
import SearchBox from "./components/SearchBox";
import TopbarTools from "./components/TopbarTools";
import Comments from "./components/Comments";
import Paragraph from "./components/Paragraph";
import BottombarTools from "./components/BottombarTools";

import {
  keydownEventHandler,
  loadBook,
  loadParagraph,
  initBook,
  recordCursor,
} from "./newtab.helper";

import "rc-slider/assets/index.css";
import "./newtab.scss";
import { RootState } from "./redux/reducers";
import { RESET_HISTORY } from "./redux/actionTypes";
import ShortcutsModal from "./components/ShortcutsModal";
import { getFileShortName } from "@src/util/file";
import { detectBookCategory, resolveBookFilter } from "@src/util/book";

declare global {
  interface Window {
    ramblerApi: {
      initTheme: () => void;
      applyTheme: (theme: string) => void;
      updateMode: () => void;
    };
  }
}

export default function Root() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

function App() {
  return (
    <div className="newtab-container">
      <TxtUpload />
      <TopbarTools />
      <Container />
      <BottombarTools />
      <ShortcutsModal />
    </div>
  );
}

function Container() {
  const dispatch = useDispatch();
  const {
    paragraph,
    currentBookId,
    cursor,
    currentBook,
    bookLoaded,
    spanCursor,
    editing,
    filter,
  } = useSelector((state: RootState) => state.readers);
  const { allowComment } = useSelector((state: RootState) => state.comments);
  const commentsVisible = paragraph && allowComment;
  const bookCategory = detectBookCategory(currentBook?.name ?? "");
  const bookFilterFunc = React.useMemo(() => {
    return filter ? resolveBookFilter(bookCategory) : null;
  }, [bookCategory, filter]);

  useEffect(() => {
    if (currentBookId) {
      loadBook(dispatch, currentBookId, bookFilterFunc);
    }
  }, [currentBookId, bookFilterFunc]);

  useEffect(() => {
    if (currentBook && bookLoaded) {
      loadParagraph(dispatch, currentBook, cursor);
      recordCursor(currentBook.id, cursor);
    }
  }, [currentBook, cursor, bookLoaded]);
  useEffect(() => {
    dispatch({ type: RESET_HISTORY });

    if (currentBook && currentBook.name) {
      document.title = getFileShortName(currentBook.name);
    }
  }, [currentBook]);

  useEffect(() => {
    initBook(dispatch);
  }, []);

  const onKeydown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!editing) {
        keydownEventHandler(
          event,
          dispatch,
          currentBook,
          paragraph,
          spanCursor
        );
      }
    },
    [currentBook, paragraph, spanCursor, editing]
  );

  useEventListener("keydown", onKeydown, {
    target: document,
  });

  useEffect(() => {
    onDbUpdate(() => {});
  }, []);

  return (
    <>
      <SearchBox />
      {paragraph ? <Paragraph bookCategory={bookCategory} /> : null}
      {commentsVisible ? (
        <Comments paragraph={paragraph?.text} bookCategory={bookCategory} />
      ) : null}
    </>
  );
}
