import * as React from "react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { i18nMsg } from "../newtab.helper";
import * as commentController from "../../../server/controller/commentController";
import * as Code from "../../../server/common/code";
import { toast } from "react-toastify";
import { IComment, IParagraph } from "../../../server/db/database";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/reducers";
import { CloseOutlined } from "@ant-design/icons";
import { useHover, useToggle } from "ahooks";
import { getCommentInfo, StockShortcuts } from "@src/util/text";
import { Img, Link, Result } from "@src/util/types";
import {
  getStockCashflow,
  getStockDaily,
  getStockIncome,
  getStockIndicators,
} from "@src/server/service/tushareService";
import {
  getStockCompany,
  getStockTimeline,
} from "@src/server/service/xueqiuService";
import { fixNumber } from "@src/util/number";
import { FieldsMap, sortComments } from "@src/util/data";
import { Button } from "antd";

export default function Comments(props: {
  bookName?: string;
  paragraph?: string;
}) {
  const { currentBookId, paragraph } = useSelector(
    (state: RootState) => state.readers
  );
  const commentIptRef = useRef<HTMLInputElement>();
  const isStock = props.bookName?.indexOf("股票") !== -1;
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
            toast.error(resp.message);
          }
        });
    } else {
      return Promise.reject("no input");
    }
  };
  const onCommentInputKeyPress = useCallback(
    (event) => {
      if (event.key === "Enter") {
        onSubmit(event.target.value)
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
          toast.error(resp.message);
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
      className="comment-container"
      onMouseEnter={() => onCommentBoxMouseEnter()}
      onMouseLeave={() => onCommentBoxMouseLeave()}
    >
      {isStock && (
        <StockShortcutsRenderer
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
      <div className="comments">
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

function generateStockShortcut(
  text: string,
  generate: (code: string, ex: string) => string
) {
  const code = text.split(":")[0];
  const ex = code.startsWith("30") || code.startsWith("00") ? "sz" : "sh";

  return generate(code, ex);
}

function StockShortcutsRenderer(props: {
  text: string;
  onClick: (text: string) => void;
}) {
  return (
    <div className="stock-shortcuts">
      {StockShortcuts.map((item) => (
        <Button
          type="link"
          className="stock-shortcut-btn"
          key={item.type}
          onClick={() =>
            props.onClick(generateStockShortcut(props.text, item.generate))
          }
        >
          {item.type.toUpperCase()}
        </Button>
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
    <div ref={ref} className="comment-item">
      {isHovering ? (
        <CloseOutlined
          className="icon-del"
          onClick={() => onDeleteClick(comment)}
        />
      ) : null}
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
      {type === "daily" && <CommentStockDaily data={data as string} />}
      {type === "indicators" && (
        <CommentStockData api={getStockIndicators} data={data as string} />
      )}
      {type === "income" && (
        <CommentStockData api={getStockIncome} data={data as string} />
      )}
      {type === "cashflow" && (
        <CommentStockData api={getStockCashflow} data={data as string} />
      )}
      {type === "ann" && (
        <CommentStockTimeline data={data as string} source="公告" />
      )}
      {type === "news" && (
        <CommentStockTimeline data={data as string} source="自选股新闻" />
      )}
      {type === "info" && <CommentStockInfo data={data as string} />}
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

function CommentStockDaily(props: { data: string }) {
  const [info, setInfo] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("tushare_token");

    if (token) {
      getStockDaily(token, props.data).then((result) => {
        const line = result.lines[0] ?? [];
        const text = result.fields
          .map(
            (item, index) =>
              `${FieldsMap[item]}: ${Number(line[index]).toFixed(3)}`
          )
          .join("; ");

        setInfo(text);
      });
    } else {
      setInfo("tushare_token 不存在");
    }
  }, [props.data]);

  return <div className="stock-data">{info}</div>;
}

function CommentStockTimeline(props: { data: string; source: string }) {
  const [list, setList] = useState([]);

  const onVisibleChange = (visible) => {
    if (visible) {
      getStockTimeline(props.data, props.source).then((list) => {
        setList(list);
      });
    }
  };

  return (
    <CommentStockInfoBlock
      label={props.source}
      onVisibleChange={onVisibleChange}
    >
      {list.map((item) => (
        <div
          className="info-item"
          key={item.id}
          dangerouslySetInnerHTML={{ __html: item.text }}
        ></div>
      ))}
    </CommentStockInfoBlock>
  );
}

function CommentStockInfo(props: { data: string }) {
  const [info, setInfo] = useState({});

  const onVisibleChange = (visible) => {
    if (visible) {
      getStockCompany(props.data).then((info) => {
        setInfo(info);
      });
    }
  };
  const infoKeys = [
    ["provincial_name", "所属省份"],
    ["classi_name", "所有制"],
    ["actual_controller", "实际控制人"],
    ["main_operation_business", "主营业务"],
    ["org_cn_introduction", "公司简介	"],
  ];
  const list = infoKeys.map((pair) => ({
    label: pair[1],
    text: info[pair[0]] ?? "--",
  }));

  return (
    <CommentStockInfoBlock label="公司信息" onVisibleChange={onVisibleChange}>
      {list.map((item) => (
        <div className="info-item" key={item.label}>
          {item.label}: {item.text}
        </div>
      ))}
    </CommentStockInfoBlock>
  );
}

function CommentStockInfoBlock(props: {
  label: string;
  children?: React.ReactNode;
  onVisibleChange: (visible: boolean) => void;
}) {
  const [show, { toggle }] = useToggle(false);
  const onClick = () => {
    toggle();
    props.onVisibleChange(!show);
  };

  return (
    <div className="stock-block">
      <div>
        <button className="block-fold-btn" onClick={onClick}>
          {props.label} {show ? "收起" : "展开"}
        </button>
      </div>
      {show && props.children}
    </div>
  );
}

function CommentStockData(props: {
  data: string;
  api: (token: string, code: string) => Promise<Result>;
}) {
  const [info, setInfo] = useState({ fields: [], lines: [] });
  const [error, setError] = useState("");
  const [bodyVisible, { toggle }] = useToggle(false);

  useEffect(() => {
    const token = window.localStorage.getItem("tushare_token");

    if (token) {
      props.api(token, props.data).then((result) => {
        setInfo(result);
      });
    } else {
      setError("tushare_token 不存在");
    }
  }, [props.data, props.api, bodyVisible]);

  return (
    <>
      {error && error}
      {info && (
        <SimpleTable
          fields={info.fields}
          lines={info.lines}
          visible={bodyVisible}
          onVisible={toggle}
        />
      )}
    </>
  );
}

function SimpleTable(props: {
  fields: string[];
  lines: Array<Array<any>>;
  visible: boolean;
  onVisible: () => void;
}) {
  return (
    <table className="simp-tb">
      <thead onClick={() => props.onVisible()}>
        <tr>
          {props.fields.map((field) => (
            <th key={field}>{FieldsMap[field]}</th>
          ))}
        </tr>
      </thead>
      {props.visible && (
        <tbody>
          {props.lines.map((line, index) => (
            <tr key={index}>
              {line.map((item, iIndex) => (
                <td key={iIndex}>{fixNumber(item)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      )}
    </table>
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
        toast.error(resp.message);
      }
    });
}
