import * as React from "react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { i18nMsg } from "../newtab.helper";
import * as commentController from "../../../server/controller/commentController";
import * as Code from "../../../server/common/code";
import { toast } from "react-toastify";
import { IComment, IParagraph } from "../../../server/db/database";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/reducers";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useHover, useToggle } from "ahooks";
import { getCommentInfo } from "@src/util/text";
import { Img, Link } from "@src/util/types";
import {
  getStockDaily,
  getStockIncome,
  getStockIndicators,
} from "@src/server/service/tushareService";
import { getStockAnnounce } from "@src/server/service/xueqiuService";
import { Button } from "antd";

export default function Comments() {
  const { currentBookId, paragraph } = useSelector(
    (state: RootState) => state.readers
  );
  const commentIptRef = useRef<HTMLInputElement>();
  const [comments, setComments] = useState<IComment[]>([]);
  const onCommentBoxMouseEnter = useCallback(() => {
    commentIptRef.current.focus();
  }, []);
  const onCommentBoxMouseLeave = useCallback(() => {
    commentIptRef.current.blur();
  }, []);
  const onCommentInputKeyPress = useCallback(
    (event) => {
      if (event.key === "Enter") {
        const trimedCommentText = event.target.value.trim();

        if (trimedCommentText) {
          event.target.value = "";
          commentController
            .saveComment(trimedCommentText, currentBookId, paragraph.id)
            .then((resp) => {
              if (resp.code === Code.OK.code) {
                console.log("save successfully");
                loadComments(setComments, currentBookId, paragraph);
              } else {
                toast.error(resp.message);
              }
            });
        }
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

  useEffect(() => {
    loadComments(setComments, currentBookId, paragraph);
  }, [currentBookId, paragraph]);

  return (
    <div
      className="comment-container"
      onMouseEnter={() => onCommentBoxMouseEnter()}
      onMouseLeave={() => onCommentBoxMouseLeave()}
    >
      <div className="comment-input-box">
        <input
          type="text"
          ref={commentIptRef}
          placeholder={i18nMsg.commentHere}
          onKeyPress={onCommentInputKeyPress}
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
      {type === "income" && <CommentStockIncome data={data as string} />}
      {type === "indicators" && <CommentStockIndicator data={data as string} />}
      {type === "ann" && <CommentStockAnnouncement data={data as string} />}
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

const FieldsMap = {
  roe: "ROE",
  close: "收盘价",
  volume_ratio: "量比",
  pe_ttm: "PE",
  turnover_rate: "换手率",
  name: "名称",
  ts_code: "代码",
  ann_date: "公告日期",
  end_date: "报告期",
  inv_turn: "存货周转率",
  ar_turn: "应收账款周转率",
  fcff: "自由现金流",
  grossprofit_margin: "销售毛利率",
  debt_to_assets: "资产负债率",
  op_yoy: "利润同比",
  ocf_yoy: "经营现金流同比",
  industry: "行业",
  pb: "PB",
  pe: "PE",
  dv_ratio: "股息率",
  total_mv: "市值",
  ocf_to_profit: "经现利润比",
  total_revenue: "营业总收入",
  revenue: "营业收入",
  core_profit: "核心利润",
  fv_value_chg_gain: "公允价值变动",
  invest_income: "投资净收益",
  total_cogs: "营业总成本",
  oper_cost: "营业成本",
  sell_exp: "销售费用",
  admin_exp: "管理费用",
  operate_profit: "营业利润",
  n_income: "净利润",
  rd_exp: "研发费用",
};

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

  return <span className="stock-data">{info}</span>;
}

function CommentStockAnnouncement(props: { data: string }) {
  const [anns, setAnns] = useState([]);
  const [show, { toggle }] = useToggle(false);

  useEffect(() => {
    if (show) {
      getStockAnnounce(props.data).then((list) => {
        setAnns(list);
      });
    }
  }, [props.data, show]);

  return (
    <div className="stock-anns">
      <div>
        <button
          className="anns-fold-btn"
          onClick={() => toggle()}
        >
          公告 {show ? "收起" : "展开"}
        </button>
      </div>
      {show &&
        anns.map((item) => (
          <div
            className="ann-item"
            key={item.id}
            dangerouslySetInnerHTML={{ __html: item.text }}
          ></div>
        ))}
    </div>
  );
}

function CommentStockIndicator(props: { data: string }) {
  const [info, setInfo] = useState({ fields: [], lines: [] });
  const [error, setError] = useState("");
  const [bodyVisible, { toggle }] = useToggle(false);

  useEffect(() => {
    const token = window.localStorage.getItem("tushare_token");

    if (token) {
      getStockIndicators(token, props.data).then((result) => {
        setInfo(result);
      });
    } else {
      setError("tushare_token 不存在");
    }
  }, [props.data, bodyVisible]);

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

function CommentStockIncome(props: { data: string }) {
  const [info, setInfo] = useState({ fields: [], lines: [] });
  const [error, setError] = useState("");
  const [bodyVisible, { toggle }] = useToggle(false);

  useEffect(() => {
    const token = window.localStorage.getItem("tushare_token");

    if (token) {
      getStockIncome(token, props.data).then((result) => {
        setInfo(result);
      });
    } else {
      setError("tushare_token 不存在");
    }
  }, [props.data, bodyVisible]);

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

function fixNumber(val: string | number | null) {
  if (!val) {
    return "--";
  }

  return typeof val === "string"
    ? val
    : Math.abs(val) < 1000
    ? val.toFixed(2)
    : formatNumber(val);
}

function formatNumber(n) {
  const language = "en";

  return Intl.NumberFormat(language, { notation: "compact" }).format(n);
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

function sortComments(list: IComment[]) {
  const symbols = ["%", "[", "$", "!", "#"];
  const isSp = (item) => symbols.some((s) => item.text.startsWith(s));
  const shouldSort = list.some(isSp);

  if (shouldSort) {
    return list.sort((a, b) => {
      const isASp = isSp(a);
      const isBSp = isSp(b);

      return Number(isASp) < Number(isBSp) ? 1 : -1;
    });
  } else {
    return list;
  }
}
