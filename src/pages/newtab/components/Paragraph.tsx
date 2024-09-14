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
import { Slider } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  FilterOutlined,
  FormOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import Input from "antd/es/input";
import Modal from "antd/es/modal";
import useEditBtn from "../../../hooks/useEditBtn";
import { BookCategory } from "@src/util/book";
import c from "classnames";
import classNames from "classnames";
import { setBookFilter } from "@src/util/storage";
import TableOfContents from "./TableOfContents";
import useReaderStore from "../store/modules/reader";

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
      className={c(["paragraph-container", `bookcate-${props.bookCategory}`])}
    >
      <div className="process">
        <Slider
          defaultValue={paragraph.index}
          value={cursor}
          min={0}
          max={currentBook.paragraphCount}
          tooltip={{ open: false }}
          onChange={onSlideChange}
          railStyle={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
          trackStyle={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
          handleStyle={{ borderColor: "rgba(0, 0, 0, 0.3)" }}
        />
      </div>
      <div className="paragraph-tools" ref={toolsRef}>
        {editing ? (
          <>
            <CheckOutlined
              className="icon icon-edit-done"
              onClick={onEditDoneClick}
            />
            <CloseOutlined
              className="icon icon-edit-cancel"
              onClick={onEditCancel}
            />
          </>
        ) : (
          <>
            <FormOutlined
              className="icon icon-edit-start"
              onClick={onEditStart}
            />
            <UnorderedListOutlined
              className="icon icon-toc"
              onClick={showTOC}
            />
            {props.bookCategory !== BookCategory.Normal && (
              <FilterOutlined
                className={classNames([
                  "icon",
                  "icon-filter-toggle",
                  { "icon-filter-active": filter },
                ])}
                onClick={onFilterToggle}
              />
            )}
          </>
        )}
      </div>
      <div
        className={
          spanCursor >= 0 ? "paragraph-text cursor-active" : "paragraph-text"
        }
        ref={paragraphRef}
      >
        {editing ? (
          <Input.TextArea
            value={textEditing}
            onChange={onTextChange}
            autoFocus
            autoSize
            onKeyDown={onKeyDown}
          />
        ) : (
          <Text text={text} cursor={spanCursor} />
        )}
      </div>
      <p className="book-name">{currentBook ? `-- ${pureBookName}` : ""}</p>
      <ShareIcons />
      <Modal
        title="Chapters"
        open={tocVisible}
        onCancel={hideTOC}
        footer={null}
      >
        <TableOfContents onClose={hideTOC} />
      </Modal>
    </div>
  );
}

function Text(props: { text: string; cursor: number }) {
  const { incCursor } = useReaderStore();
  const arr = props.text.split(/([,，。.?？;!！；])/g);
  arr.push("");

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
        <span className={index === props.cursor ? "is-active" : ""}>
          {item}
        </span>
      ))}
    </>
  );
}
