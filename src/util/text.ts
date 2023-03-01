import { CommentInfo, Img, Link, TextDataType, TextFormatType } from "./types";

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
}

const StockCashflowParser: Parser<string> = {
  type: "cashflow",
  reg: /^%(.*)%CASHFLOW$/,
  resolve: (match) => [match[1], StockCashflowParser.type],
}

const StockAnnouncementParser: Parser<string> = {
  type: "ann",
  reg: /^#(.*)#ANN$/,
  resolve: (match) => [match[1], StockAnnouncementParser.type],
}

const StockNewsParser: Parser<string> = {
  type: "news",
  reg: /^#(.*)#NEWS$/,
  resolve: (match) => [match[1], StockNewsParser.type],
}

const parsers: Parser[] = [
  LinkParser,
  ImgParser,
  StockDailyParser,
  StockIndicatorsParser,
  StockIncomeParser,
  StockCashflowParser,
  StockAnnouncementParser,
  StockNewsParser
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
