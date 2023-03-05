import { IParagraph } from "@src/server/db/database";

export enum BookCategory {
  Stock = "stock",
  Wordbook = "wordbook",
  Daily = 'daily',
  Question = 'question',
  English = 'english',
  Normal = "normal",
}
const stockIdentifiers = ["stock", "股票"];
const wordIdentifiers = ["GRE", "单词", "Word", "TOEFL"];
const questionIdentifiers = ['问题', 'Question'];
const englishIdentifiers = ['English', '英语'];

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
    cate: BookCategory.Daily,
    reg: /\d{4}/
  },
  {
    cate: BookCategory.Question,
    reg: arr2reg(questionIdentifiers)
  },
  {
    cate: BookCategory.English,
    reg: arr2reg(englishIdentifiers)
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
    case BookCategory.Question:
    case BookCategory.English:
      return (paragraph: IParagraph) => !paragraph.text.startsWith('-')
    default:
      return null;
  }
}