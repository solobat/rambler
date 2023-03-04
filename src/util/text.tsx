import { saveWord } from "@src/server/controller/wordController";
import dayjs from "dayjs";
import {
  CommentInfo,
  DailyFormatType,
  Img,
  Link,
  TextDataType,
  TextFormatType,
  WordbookFormatType,
} from "./types";
import { addWord } from "./word";

interface Parser<T = TextDataType> {
  type: TextFormatType;
  reg: RegExp;
  resolve: (match: RegExpMatchArray) => [T, TextFormatType];
}

const LinkParser: Parser<Link> = {
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

const ImgParser: Parser<Img> = {
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

const StockDailyParser: Parser<string> = {
  type: "daily",
  reg: /^\$(.*)\$$/,
  resolve: (match) => [match[1], StockDailyParser.type],
};

const StockIndicatorsParser: Parser<string> = {
  type: "indicators",
  reg: /^%(.*)%$/,
  resolve: (match) => [match[1], StockIndicatorsParser.type],
};

const StockIncomeParser: Parser<string> = {
  type: "income",
  reg: /^%(.*)%INCOME$/,
  resolve: (match) => [match[1], StockIncomeParser.type],
};

const StockCashflowParser: Parser<string> = {
  type: "cashflow",
  reg: /^%(.*)%CASHFLOW$/,
  resolve: (match) => [match[1], StockCashflowParser.type],
};

const StockAnnouncementParser: Parser<string> = {
  type: "ann",
  reg: /^#(.*)#ANN$/,
  resolve: (match) => [match[1], StockAnnouncementParser.type],
};

const StockNewsParser: Parser<string> = {
  type: "news",
  reg: /^#(.*)#NEWS$/,
  resolve: (match) => [match[1], StockNewsParser.type],
};

const StockInfoParser: Parser<string> = {
  type: "info",
  reg: /^#(.*)#INFO$/,
  resolve: (match) => [match[1], StockInfoParser.type],
};

const WordEtymologyParser: Parser<string> = {
  type: "etymology",
  reg: /^#(.*)#ETYMOLOGY$/,
  resolve: (match) => [match[1], WordEtymologyParser.type],
};

const WordRootParser: Parser<string> = {
  type: "root",
  reg: /^#(.*)#ROOT$/,
  resolve: (match) => [match[1], WordRootParser.type],
};

const WordFigureParser: Parser<string> = {
  type: "figure",
  reg: /^#(.*)#FIGURE$/,
  resolve: (match) => [match[1], WordFigureParser.type],
};

const DailyInvestParser: Parser<string> = {
  type: "invest",
  reg: /^#(.*)#INVEST$/,
  resolve: (match) => [match[1], DailyInvestParser.type],
};

const parsers: Parser[] = [
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

interface StockShortcut {
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

interface WordbookShortcut {
  type: "dicts" | "fill" | WordbookFormatType;
  action?: (word: string) => any;
  generate?: (word: string) => string;
}

export const WordbookShortcuts: WordbookShortcut[] = [
  {
    type: "dicts",
    action: (word) => {
      chrome.runtime.sendMessage(
        "cdombiofmnhpmohkhhkccejnfmodnfjb",
        {
          action: "globalEventEmitted",
          data: {
            action: "translate",
            payload: { value: word },
          },
        },
        () => {}
      );
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

interface DailyShortcut {
  type: DailyFormatType;
  generate?: (date: string) => string;
}

export const DailyShortcuts: DailyShortcut[] = [
  {
    type: "invest",
    generate: (date) => `#${date}#INVEST`,
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
