export const tuple = <T extends string[]>(...args: T) => args;

export interface Link {
  label: string;
  url: string;
}

export interface Img extends Link {}

export type TextDataType = Link | Img | string;

export type BaseFormatType = "link" | "img" | "text";

/**
 * `etymology`: 显示单词的词源;<br />
 * `root`: 显示单词的词根;<br />
 * `figure`: 显示单词的图像;
 */
export type WordbookFormatType = "etymology" | "root" | "figure";

/**
 * `correct`: 使用 freegpt.one 纠正你的英语句子;
 */
export type EnglishFormatType = "correct";
export type TextFormatType =
  | BaseFormatType
  | WordbookFormatType
  | EnglishFormatType;

export interface CommentInfo {
  type: TextFormatType;
  data: Link | Img | string;
}
