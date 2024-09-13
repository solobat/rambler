import { saveWord } from "@src/server/controller/wordController";
import dayjs from "dayjs";
import {
  CommentInfo,
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

export const parsers: Parser[] = [
  LinkParser,
  ImgParser,
  WordEtymologyParser,
  WordRootParser,
  WordFigureParser,
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
      const info = window.prompt("请输入单词的定义");

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

export interface EnglishShortcut {
  type: EnglishFormatType;
  action?: (paragraph: string) => any;
}

export const EnglishShortcuts: EnglishShortcut[] = [
  {
    type: "correct",
    action: (paragraph) => {
      sendMsgToIHelpers("correct", `这段英语写得有问题吗：${paragraph}`);
    },
  },
];

export interface TableRowRenders {
  [key: string]: (value: string | number) => React.ReactNode;
}

function sendMsgToIHelpers(action: string, value: string) {
  chrome.runtime.sendMessage(
    import.meta.env.VITE_APP_IHELPERS_ID,
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
