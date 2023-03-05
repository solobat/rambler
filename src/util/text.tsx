import { saveWord } from "@src/server/controller/wordController";
import dayjs from "dayjs";
import {
  CommentInfo,
  DailyFormatType,
  EnglishFormatType,
  Img,
  Link,
  TextDataType,
  TextFormatType,
  WordbookFormatType,
} from "./types";

export interface Parser<T = TextDataType> {
  type: TextFormatType;
  reg: RegExp;
  resolve: (match: RegExpMatchArray) => [T, TextFormatType];
}

/**
 * @template
 * ```
 * [{label}]({url})
 * ```
 */
export const LinkParser: Parser<Link> = {
  type: "link",
  reg: /^\[(.*)\]\((.*)\)$/,
  resolve: (match) => [
    {
      label: match[1],
      url: match[2],
    },
    LinkParser.type,
  ],
};

/**
 * @template
 * ```
 * ![{name}]({url})
 * ```
 */
export const ImgParser: Parser<Img> = {
  type: "img",
  reg: /^!\[(.*)\]\((.*)\)$/,
  resolve: (match) => [
    {
      label: match[1],
      url: match[2],
    },
    ImgParser.type,
  ],
};

/**
 * @template
 * ```
 * ${code.ex}$
 * ```
 */
export const StockDailyParser: Parser<string> = {
  type: "daily",
  reg: /^\$(.*)\$$/,
  resolve: (match) => [match[1], StockDailyParser.type],
};

/**
 * @template
 * ```
 * %{code.ex}%
 * ```
 */
export const StockIndicatorsParser: Parser<string> = {
  type: "indicators",
  reg: /^%(.*)%$/,
  resolve: (match) => [match[1], StockIndicatorsParser.type],
};

/**
 * @template
 * ```
 * %{code.ex}%INCOME
 * ```
 */
export const StockIncomeParser: Parser<string> = {
  type: "income",
  reg: /^%(.*)%INCOME$/,
  resolve: (match) => [match[1], StockIncomeParser.type],
};

/**
 * @template
 * ```
 * %{code.ex}%CASHFLOW
 * ```
 */
export const StockCashflowParser: Parser<string> = {
  type: "cashflow",
  reg: /^%(.*)%CASHFLOW$/,
  resolve: (match) => [match[1], StockCashflowParser.type],
};

/**
 * @template
 * ```
 * #{code.ex}#ANN
 * ```
 */
export const StockAnnouncementParser: Parser<string> = {
  type: "ann",
  reg: /^#(.*)#ANN$/,
  resolve: (match) => [match[1], StockAnnouncementParser.type],
};

/**
 * @template
 * ```
 * #{code.ex}#NEWS
 * ```
 */
export const StockNewsParser: Parser<string> = {
  type: "news",
  reg: /^#(.*)#NEWS$/,
  resolve: (match) => [match[1], StockNewsParser.type],
};

/**
 * @template
 * ```
 * #{code.ex}#INFO
 * ```
 */
export const StockInfoParser: Parser<string> = {
  type: "info",
  reg: /^#(.*)#INFO$/,
  resolve: (match) => [match[1], StockInfoParser.type],
};

/**
 * @template
 * ```
 * #{word}#ETYMOLOGY
 * ```
 */
export const WordEtymologyParser: Parser<string> = {
  type: "etymology",
  reg: /^#(.*)#ETYMOLOGY$/,
  resolve: (match) => [match[1], WordEtymologyParser.type],
};

/**
 * @template
 * ```
 * #{word}#ROOT
 * ```
 */
export const WordRootParser: Parser<string> = {
  type: "root",
  reg: /^#(.*)#ROOT$/,
  resolve: (match) => [match[1], WordRootParser.type],
};

/**
 * @template
 * ```
 * #{word}#FIGURE
 * ```
 */
export const WordFigureParser: Parser<string> = {
  type: "figure",
  reg: /^#(.*)#FIGURE$/,
  resolve: (match) => [match[1], WordFigureParser.type],
};

/**
 * @template
 * ```
 * #{date}#INVEST
 * ```
 */
export const DailyInvestParser: Parser<string> = {
  type: "invest",
  reg: /^#(.*)#INVEST$/,
  resolve: (match) => [match[1], DailyInvestParser.type],
};

export const parsers: Parser[] = [
  LinkParser,
  ImgParser,
  StockDailyParser,
  StockIndicatorsParser,
  StockIncomeParser,
  StockCashflowParser,
  StockAnnouncementParser,
  StockNewsParser,
  StockInfoParser,
  WordEtymologyParser,
  WordRootParser,
  WordFigureParser,
  DailyInvestParser,
];

export function getCommentInfo(text: string): CommentInfo {
  const result = applyParser(text, parsers);

  return result
    ? { type: result[1], data: result[0] }
    : {
        type: "text",
        data: text,
      };
}

function applyParser(
  text: string,
  parsers: Parser[]
): [TextDataType, TextFormatType] | null {
  for (const parser of parsers) {
    const match = text.match(parser.reg);

    if (match) {
      return parser.resolve(match);
    }
  }

  return null;
}

export interface StockShortcut {
  type: TextFormatType | "xueqiu";
  generate: (code: string, ex: string) => string;
}
export const StockShortcuts: StockShortcut[] = [
  {
    type: "daily",
    generate: (code, ex) => `$${code}.${ex}$`,
  },
  {
    type: "indicators",
    generate: (code, ex) => `%${code}.${ex}%`,
  },
  {
    type: "income",
    generate: (code, ex) => `%${code}.${ex}%INCOME`,
  },
  {
    type: "cashflow",
    generate: (code, ex) => `%${code}.${ex}%CASHFLOW`,
  },
  {
    type: "news",
    generate: (code, ex) => `#${ex.toUpperCase()}${code}#NEWS`,
  },
  {
    type: "ann",
    generate: (code, ex) => `#${ex.toUpperCase()}${code}#ANN`,
  },
  {
    type: "info",
    generate: (code, ex) => `#${ex.toUpperCase()}${code}#INFO`,
  },
  {
    type: "xueqiu",
    generate: (code, ex) =>
      `[雪球](https://xueqiu.com/S/${ex.toUpperCase()}${code})`,
  },
];

/**
 * `dicts`: Search for the word on dicts.cn website;<br />
 * `fill`: Copy and paste the JSON data for the word from dicts.cn into the prompt dialog;
 */
export interface WordbookShortcut {
  type: "dicts" | "fill" | WordbookFormatType;
  action?: (word: string) => any;
  generate?: (word: string) => string;
}

export const WordbookShortcuts: WordbookShortcut[] = [
  {
    type: "dicts",
    action: (word) => {
      sendMsgToIHelpers("translate", word);
    },
  },
  {
    type: "fill",
    action: (word) => {
      const info = window.prompt("Please enter the definition of the word");

      if (info) {
        saveWord(word, info);
      }
    },
  },
  {
    type: "etymology",
    generate: (word) => `#${word}#ETYMOLOGY`,
  },
  {
    type: "root",
    generate: (word) => `#${word}#ROOT`,
  },
  {
    type: "figure",
    generate: (word) => `#${word}#FIGURE`,
  },
];

export interface DailyShortcut {
  type: DailyFormatType;
  generate?: (date: string) => string;
}

export const DailyShortcuts: DailyShortcut[] = [
  {
    type: "invest",
    generate: (date) => `#${date}#INVEST`,
  },
];

export interface EnglishShortcut {
  type: EnglishFormatType;
  action?: (paragraph: string) => any;
}

export const EnglishShortcuts: EnglishShortcut[] = [
  {
    type: "correct",
    action: (paragraph) => {
      sendMsgToIHelpers("correct", `这名英语写得有问题吗：${paragraph}`);
    },
  },
];

export interface TableRowRenders {
  [key: string]: (value: string | number) => React.ReactNode;
}

export const WSCNInvestCalendarRenders: TableRowRenders = {
  public_date: (value: number) => dayjs(value * 1000).format("HH:mm"),
  importance: (value: number) => `${value}星`,
  wscn_ticker: (value: string) => (
    <a
      target="_blank"
      href={`https://wallstreetcn.com/data-analyse/${value}/DXY.OTC`}
    >
      详情
    </a>
  ),
};

function sendMsgToIHelpers(action: string, value: string) {
  chrome.runtime.sendMessage(
    "cdombiofmnhpmohkhhkccejnfmodnfjb",
    {
      action: "globalEventEmitted",
      data: {
        action,
        payload: { value },
      },
    },
    () => {}
  );
}
