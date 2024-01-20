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
import Slider from "rc-slider";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/reducers";
import {
  ADD_HISTORY,
  INC_CURSOR,
  SET_CURSOR,
  SET_FILTER,
  UPDATE_PARAGRAH_TEXT,
} from "../redux/actionTypes";
import {
  CheckOutlined,
  CloseOutlined,
  FilterOutlined,
  FormOutlined,
} from "@ant-design/icons";
import Input from "antd/es/input";
import useEditBtn from "../../../hooks/useEditBtn";
import { updateParagraphText } from "../redux/actions/reader";
import { BookCategory } from "@src/util/book";
import c from "classnames";
import classNames from "classnames";
import { setBookFilter } from "@src/util/storage";

export default function Paragraph(props: { bookCategory: BookCategory }) {
  const dispatch = useDispatch();
  const { paragraph, currentBook, cursor, spanCursor, filter } = useSelector(
    (state: RootState) => state.readers
  );
  const paragraphRef = useRef();
  const onSlideChange = useCallback((newIndex) => {
    dispatch({ type: SET_CURSOR, payload: newIndex });
    dispatch({ type: ADD_HISTORY, payload: newIndex });
  }, []);
  const pureBookName = useMemo(() => {
    return getPureBookName(false, currentBook);
  }, [currentBook]);
  const text = (paragraph.text || "").trim();
  const onEditDone = useCallback(
    (newText) => {
      dispatch(updateParagraphText(paragraph.id, newText) as any);
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
    dispatch({ type: SET_FILTER, payload: !filter });
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
          onChange={onSlideChange}
          railStyle={{
            height: "2px",
            borderRadius: "0",
          }}
          trackStyle={{
            height: "2px",
            borderRadius: "0",
          }}
          handleStyle={{
            borderRadius: "0",
          }}
        />
      </div>
      <div className="paragraph-tools">
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
    </div>
  );
}

function Text(props: { text: string; cursor: number }) {
  const dispatch = useDispatch();
  const total = useMemo(() => {
    return splitText(props.text);
  }, [props.text]);

  useEffect(() => {
    if (props.cursor >= total.length) {
      dispatch({ type: INC_CURSOR });
    }
  }, [props.cursor, total]);

  return (
    <>
      {total.map((item, index) => (
        <span className={index <= props.cursor ? "is-active" : ""}>
          {item}
        </span>
      ))}
    </>
  );
}

function splitText(text: string, punctuations = `,，。.?？;!！；…“”`): string[] {
  const escapedPunctuations = punctuations.replace(
    /[-\/\\^$*+?.()|[\]{}]/g,
    "\\$&"
  );
  
  const regex = new RegExp(`([${escapedPunctuations}])`, "g");

  const arr = text.split(regex);
  arr.push("");

  const total = arr.reduce(
    (memo, item, index) => {
      if (index % 2 !== 0) {
        if (memo.temp.length + item.length >= 10 || !',，:：'.includes(item)) {
          memo.total.push(`${memo.temp}${item}`);
          memo.temp = "";
        } else {
          memo.temp += item;
        }
      } else {
        memo.temp += item;
      }
      if (index === arr.length - 1 && memo.temp) {
        memo.total.push(memo.temp);
      }

      return memo;
    },
    { total: [] as string[], temp: "" }
  ).total;

  return total;
}
