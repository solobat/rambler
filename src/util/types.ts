export const tuple = <T extends string[]>(...args: T) => args;

export interface Link {
  label: string;
  url: string;
}

export interface Img extends Link {}

export type TextDataType = Link | Img | string;

export type TextFormatType = "link" | "img" | "text" | "indicators" | "daily" | "income" | "ann" | "news";

export interface CommentInfo {
  type: TextFormatType;
  data: Link | Img | string;
}

export type Result = {
  fields: string[];
  lines: Array<Array<string | number>>;
};