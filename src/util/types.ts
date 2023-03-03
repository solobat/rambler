export const tuple = <T extends string[]>(...args: T) => args;

export interface Link {
  label: string;
  url: string;
}

export interface Img extends Link {}

export type TextDataType = Link | Img | string;

export type BaseFormatType = "link" | "img" | "text";
export type StockFormatType =
  | "indicators"
  | "daily"
  | "income"
  | "ann"
  | "news"
  | "cashflow"
  | "info";
export type WordFormatType = "def" | "mind";
export type TextFormatType = BaseFormatType | StockFormatType | WordFormatType;

export interface CommentInfo {
  type: TextFormatType;
  data: Link | Img | string;
}

export type Result = {
  fields: string[];
  lines: Array<Array<string | number>>;
};
