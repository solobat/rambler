import { IParagraph } from "@src/server/db/database";
import { isParameter } from "typescript";

export enum BookCategory {
  Stock = "stock",
  Wordbook = "wordbook",
  Normal = "normal",
}
const stockIdentifiers = ["stock", "股票"];
const wordIdentifiers = ["GRE", "单词", "Word", "TOEFL"];

interface BookCategoryMapItem {
  cate: BookCategory;
  reg?: RegExp;
}

const BookCategoryMap: BookCategoryMapItem[] = [
  {
    cate: BookCategory.Stock,
    reg: arr2reg(stockIdentifiers),
  },
  {
    cate: BookCategory.Wordbook,
    reg: arr2reg(wordIdentifiers),
  },
  {
    cate: BookCategory.Normal,
  },
];

function arr2reg(arr: string[]) {
  return new RegExp(arr.join("|"), "i");
}

export function detectBookCategory(name: string) {
  const match = BookCategoryMap.find((item) =>
    item.reg ? item.reg.test(name) : true
  );

  return match.cate;
}

export type BookFilterFunc = (paragraph: IParagraph) => boolean

export function resolveBookFilter(cate: BookCategory): BookFilterFunc | null {
  switch (cate) {
    case BookCategory.Stock:
      return (paragraph: IParagraph) => /T[0-4]/.test(paragraph.text)
    default:
      return null;
  }
}