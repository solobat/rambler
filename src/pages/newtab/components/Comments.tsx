import * as React from "react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { i18nMsg } from "../newtab.helper";
import * as commentController from "../../../server/controller/commentController";
import * as Code from "../../../server/common/code";
import { IComment, IParagraph } from "../../../server/db/database";
import { useHover, useToggle } from "ahooks";
import {
  EnglishShortcuts,
  getCommentInfo,
  WordbookShortcuts,
} from "@src/util/text";
import { Img, Link } from "@src/util/types";
import { sortComments } from "@src/util/data";
import { BookCategory } from "@src/util/book";
import useReaderStore from "../store/modules/reader";
import { useToast } from "./Toast";
import { CloseIcon } from "@src/assets/Icons";

export default function Comments(props: {
  bookCategory: BookCategory;
  paragraph?: string;
}) {
  const { addToast } = useToast();
  const { currentBookId, paragraph } = useReaderStore();
  const commentIptRef = useRef<HTMLInputElement>();
  const [comments, setComments] = useState<IComment[]>([]);
  const onCommentBoxMouseEnter = useCallback(() => {
    commentIptRef.current.focus();
  }, []);
  const onCommentBoxMouseLeave = useCallback(() => {
    commentIptRef.current.blur();
  }, []);
  const onSubmit = (text: string) => {
    const trimedCommentText = text.trim();

    if (trimedCommentText) {
      commentIptRef.current.value = "";

      return commentController
        .saveComment(trimedCommentText, currentBookId, paragraph.id)
        .then((resp) => {
          if (resp.code === Code.OK.code) {
            console.log("save successfully");
            loadComments(setComments, currentBookId, paragraph);
          } else {
            addToast({
              message: resp.message,
              type: "error",
            });
          }
        });
    } else {
      return Promise.reject("no input");
    }
  };
  const onCommentInputKeyPress = useCallback(
    (event) => {
      if (event.key === "Enter") {
        onSubmit(event.target.value);
      }
    },
    [currentBookId, paragraph]
  );
  const onCommentDeleteClick = useCallback(
    (comment: IComment) => {
      commentController.deleteComment(comment.id).then((resp) => {
        if (resp.code === Code.OK.code) {
          loadComments(setComments, currentBookId, paragraph);
        } else {
          addToast({
            message: resp.message,
            type: "error",
          });
        }
      });
    },
    [currentBookId, paragraph]
  );
  const onShortcutClick = (text: string) => {
    onSubmit(text);
  };

  useEffect(() => {
    loadComments(setComments, currentBookId, paragraph);
  }, [currentBookId, paragraph]);

  return (
    <div
      className="fixed h-64 left-24 right-24 bottom-0 transition-all duration-200 ease-in"
      onMouseEnter={() => onCommentBoxMouseEnter()}
      onMouseLeave={() => onCommentBoxMouseLeave()}
    >
      {props.bookCategory === BookCategory.Wordbook && (
        <WordbookShortcutsRenderer
          text={props.paragraph}
          onClick={onShortcutClick}
        />
      )}
      {props.bookCategory === BookCategory.English && (
        <EnglishShortcutsRenderer
          text={props.paragraph}
          onClick={onShortcutClick}
        />
      )}
      <div className="comment-input-box">
        <input
          type="text"
          ref={commentIptRef}
          placeholder={i18nMsg.commentHere}
          onKeyDown={onCommentInputKeyPress}
        />
      </div>
      <div className="mx-auto p-2.5 w-[70vw] h-50 overflow-auto text-white/60 text-xs">
        {comments.map((comment, index) => {
          return (
            <Comment
              key={index}
              comment={comment}
              onDeleteClick={onCommentDeleteClick}
            />
          );
        })}
      </div>
    </div>
  );
}

function WordbookShortcutsRenderer(props: {
  text: string;
  onClick: (text: string) => void;
}) {
  return (
    <div className="stk-shortcuts">
      {WordbookShortcuts.map((item) => (
        <button
          className="btn btn-link stk-shortcut-btn"
          key={item.type}
          onClick={(event) => {
            event.currentTarget.blur();
            if (item.action) {
              item.action(props.text);
            }
            if (item.generate) {
              props.onClick(item.generate(props.text));
            }
          }}
        >
          {item.type.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function EnglishShortcutsRenderer(props: {
  text: string;
  onClick: (text: string) => void;
}) {
  return (
    <div className="stk-shortcuts">
      {EnglishShortcuts.map((item) => (
        <button
          className="btn btn-link stk-shortcut-btn"
          key={item.type}
          onClick={(event) => {
            event.currentTarget.blur();
            if (item.action) {
              item.action(props.text);
            }
          }}
        >
          {item.type.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

interface CommentProps {
  comment: IComment;
  onDeleteClick: (comment: IComment) => void;
}

function Comment(props: CommentProps) {
  const { comment, onDeleteClick } = props;
  const ref = useRef<HTMLDivElement>(null);
  const isHovering = useHover(ref);

  return (
    <div ref={ref} className="relative leading-5">
      {isHovering ? <CloseIcon onClick={() => onDeleteClick(comment)} /> : null}
      <CommentRenderer text={comment.text} />
    </div>
  );
}

function CommentRenderer(props: { text: string }) {
  const { type, data } = getCommentInfo(props.text);

  return (
    <>
      {type === "link" && <CommentLink data={data as Link} />}
      {type === "img" && <CommentImg data={data as Img} />}
      {type === "text" && <>{data}</>}
    </>
  );
}

function CommentLink(props: { data: Link }) {
  return (
    <a href={props.data.url} target="_blank">
      {props.data.label}
    </a>
  );
}

function CommentImg(props: { data: Img }) {
  return <img alt={props.data.label} src={props.data.url} />;
}

function CommentInfoBlock(props: {
  label: string;
  children?: React.ReactNode;
  onVisibleChange: (visible: boolean) => void;
}) {
  const [show, { toggle }] = useToggle(false);
  const onClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    toggle();
    props.onVisibleChange(!show);
    event.currentTarget.blur();
  };

  return (
    <div className="stk-block">
      <div>
        <button className="btn btn-link block-fold-btn" onClick={onClick}>
          {props.label} {show ? "收起" : "展开"}
        </button>
      </div>
      {show && props.children}
    </div>
  );
}

function loadComments(
  setComments: React.Dispatch<React.SetStateAction<IComment[]>>,
  currentBookId: number,
  paragraph: IParagraph
) {
  commentController
    .queryByParagraph(currentBookId, paragraph.id)
    .then((resp) => {
      if (resp.code === Code.OK.code) {
        if (resp.data) {
          const comments = resp.data;

          setComments(sortComments(comments));
        }
      } else {
        console.log(resp.message);
      }
    });
}
