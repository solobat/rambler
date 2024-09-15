import * as React from "react";
import {
  useContext,
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { getPureBookName } from "../newtab.helper";
import ShareIcons from "./ShareIcons";
import { BookCategory } from "@src/util/book";
import c from "classnames";
import { setBookFilter } from "@src/util/storage";
import TableOfContents from "./TableOfContents";
import useReaderStore from "../store/modules/reader";
import Modal from "./Modal";
import useEditBtn from "@src/hooks/useEditBtn";
import {
  EditDoneIcon,
  EditCancelIcon,
  EditStartIcon,
  TocIcon,
  FilterIcon,
} from "@src/assets/Icons";

export default function Paragraph(props: { bookCategory: BookCategory }) {
  const {
    paragraph,
    currentBook,
    cursor,
    spanCursor,
    filter,
    setCursor,
    addHistory,
    setFilter,
    updateParagraphText,
  } = useReaderStore();
  const paragraphRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const [tocVisible, setTocVisible] = useState(false);
  const onSlideChange = useCallback((newIndex) => {
    setCursor(newIndex);
    addHistory(newIndex);
  }, []);
  const pureBookName = useMemo(() => {
    return getPureBookName(false, currentBook);
  }, [currentBook]);
  const text = useMemo(() => {
    return (paragraph.text || "").trim();
  }, [paragraph.text]);
  const onEditDone = useCallback(
    (newText) => {
      updateParagraphText(paragraph.id, newText);
    },
    [paragraph.id]
  );
  const {
    editing,
    textEditing,
    onEditStart,
    onEditDoneClick,
    onEditCancel,
    onTextChange,
  } = useEditBtn(text, onEditDone);
  const onFilterToggle = () => {
    setBookFilter(!filter);
    setFilter(!filter);
  };
  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    event
  ) => {
    if (event.metaKey && event.key === "Enter") {
      onEditDoneClick();
    } else if (event.key === "Escape") {
      onEditCancel();
    }
  };

  const showTOC = () => {
    setTocVisible(true);
  };

  const hideTOC = () => {
    setTocVisible(false);
  };

  useEffect(() => {
    if (paragraphRef.current && toolsRef.current) {
      toolsRef.current.style.height = `${paragraphRef.current.offsetHeight}px`;
    }
  }, [text, editing]);

  return (
    <div
      className={c([
        "relative w-[70vw] mx-auto mt-[46px] text-left text-[#d0d3d8]",
        `bookcate-${props.bookCategory}`,
      ])}
    >
      <div className="py-5 opacity-0 transition-opacity duration-200 ease-in hover:opacity-100">
        <input
          type="range"
          min={0}
          max={currentBook.paragraphCount}
          value={cursor}
          className="range range-xs"
          step="1"
          onChange={(e) => onSlideChange(parseInt(e.target.value))}
        />
      </div>
      <div
        className="absolute z-10 top-[60px] -left-5 transition-opacity duration-200 ease-in opacity-0 hover:opacity-100 flex flex-col"
        ref={toolsRef}
      >
        {editing ? (
          <>
            <EditDoneIcon onClick={onEditDoneClick} />
            <EditCancelIcon onClick={onEditCancel} />
          </>
        ) : (
          <>
            <EditStartIcon onClick={onEditStart} />
            <TocIcon onClick={showTOC} />
            {props.bookCategory !== BookCategory.Normal && (
              <FilterIcon onClick={onFilterToggle} isActive={filter} />
            )}
          </>
        )}
      </div>
      <div
        className={c([
          "text-base leading-relaxed font-sans text-justify max-h-[312px] overflow-auto",
          props.bookCategory === "wordbook" ? "text-[56px] font-semibold" : "",
          props.bookCategory === "stk" ? "text-2xl font-semibold" : "",
        ])}
        ref={paragraphRef}
      >
        {editing ? (
          <textarea
            className="w-full p-2 border border-gray-300 rounded"
            value={textEditing}
            onChange={onTextChange}
            autoFocus
            onKeyDown={onKeyDown}
          />
        ) : (
          <Text text={text} cursor={spanCursor} />
        )}
      </div>
      <p className="text-right italic mr-8 opacity-50">
        {currentBook ? `-- ${pureBookName}` : ""}
      </p>
      <ShareIcons />
      <Modal title="章节" isOpen={tocVisible} onClose={hideTOC}>
        <TableOfContents onClose={hideTOC} />
      </Modal>
    </div>
  );
}

function Text(props: { text: string; cursor: number }) {
  const { incCursor } = useReaderStore();
  const arr = props.text.split(/([,，。.?？;!！；])/g);
  arr.push("");
  const cursorActive = props.cursor >= 0;
  const total = arr.reduce(
    (memo, item, index) => {
      if (index % 2 !== 0) {
        memo.total.push(`${memo.temp}${item}`);
        memo.temp = "";
      } else {
        memo.temp = item;
      }

      return memo;
    },
    { total: [] as string[], temp: "" }
  ).total;

  useEffect(() => {
    if (props.cursor >= total.length) {
      incCursor();
    }
  }, [props.cursor, total]);

  return (
    <>
      {total.map((item, index) => (
        <span
          className={c(
            "transition-all duration-200 ease-in",
            cursorActive && index !== props.cursor
              ? "opacity-20 blur-sm"
              : "opacity-100 blur-none",
            index === props.cursor && "font-bold"
          )}
        >
          {item}
        </span>
      ))}
    </>
  );
}
