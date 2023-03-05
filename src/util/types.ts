export const tuple = <T extends string[]>(...args: T) => args;

export interface Link {
  label: string;
  url: string;
}

export interface Img extends Link {}

export type TextDataType = Link | Img | string;

export type BaseFormatType = "link" | "img" | "text";
/**
 * `indicators`: Display the stock indicators data provided by Tushare.pro's API.<br />
 * `daily`: Display the stock daily data provided by Tushare.pro's API.<br />
 * `income`: Display the stock income statement provided by Tushare.pro's API.<br />
 * `cashflow`: Display the stock cashflow statement provided by Tushare.pro's API.<br />
 * `ann`: Display the stock announcement provided by xueqiu's API.<br />
 * `news`: Display the stock news provided by xueqiu's API.<br />
 * `info`: Display the stock basic info provided by xueqiu's API.
 */
export type StockFormatType =
  | "indicators"
  | "daily"
  | "income"
  | "ann"
  | "news"
  | "cashflow"
  | "info";

/**
 * `etymology`: show the etymology of the word;<br />
 * `root`: show the root of the word;<br />
 * `figure`: show the figure of the word;
 */
export type WordbookFormatType = "etymology" | "root" | "figure";

/**
 * `invest`: show the invest calendar supplied by https://wallstreetcn.com/
 */
export type DailyFormatType = "invest";

/**
 * `correct`: correct your english sentence using freegpt.one;
 */
export type EnglishFormatType = "correct";
export type TextFormatType =
  | BaseFormatType
  | StockFormatType
  | WordbookFormatType
  | DailyFormatType
  | EnglishFormatType;

export interface CommentInfo {
  type: TextFormatType;
  data: Link | Img | string;
}

export type Result = {
  fields: string[];
  lines: Array<Array<string | number>>;
};
