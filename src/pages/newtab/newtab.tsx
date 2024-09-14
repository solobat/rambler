import * as React from "react";
import { useCallback, useEffect } from "react";
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
import ShortcutsModal from "./components/ShortcutsModal";
import { getFileShortName } from "@src/util/file";
import { detectBookCategory, resolveBookFilter } from "@src/util/book";
import useReaderStore from "./store/modules/reader";
import useCommentsStore from "./store/modules/comments";
import useSearchStore from "./store/modules/search";

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
  return <App />;
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
  const {
    paragraph,
    currentBookId,
    cursor,
    currentBook,
    bookLoaded,
    spanCursor,
    editing,
    filter,
    setCursor,
    setCurrentBookId,
    setEditing,
    setSpanCursor,
    setCurrentBook,
    setBookLoaded,
    setFilter,
    resetHistory,
    setParagraph,
  } = useReaderStore();
  const { setSearchBoxVisible } = useSearchStore();
  const { allowComment } = useCommentsStore();
  const commentsVisible = paragraph && allowComment;
  const bookCategory = detectBookCategory(currentBook?.name ?? "");
  const bookFilterFunc = React.useMemo(() => {
    return filter ? resolveBookFilter(bookCategory) : null;
  }, [bookCategory, filter]);

  useEffect(() => {
    if (currentBookId) {
      loadBook(
        currentBookId,
        bookFilterFunc,
        setCurrentBook,
        setBookLoaded,
        setCursor
      );
    }
  }, [currentBookId, bookFilterFunc, setCurrentBook, setBookLoaded]);

  useEffect(() => {
    if (currentBook && bookLoaded) {
      loadParagraph(currentBook, cursor, setParagraph);
      recordCursor(currentBook.id, cursor);
    }
  }, [currentBook, cursor, bookLoaded, setCursor]);

  useEffect(() => {
    resetHistory();

    if (currentBook && currentBook.name) {
      document.title = getFileShortName(currentBook.name);
    }
  }, [currentBook, resetHistory]);

  useEffect(() => {
    initBook(setCurrentBookId);
  }, [setCurrentBook, setBookLoaded, setCursor]);

  const onKeydown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!editing) {
        keydownEventHandler(
          event,
          currentBook,
          paragraph,
          spanCursor,
          setCursor,
          setEditing,
          setSpanCursor,
          setSearchBoxVisible
        );
      }
    },
    [currentBook, paragraph, spanCursor, editing, setCursor, setFilter]
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
