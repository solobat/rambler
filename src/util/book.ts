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
