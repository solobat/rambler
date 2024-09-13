import { IComment } from "@src/server/db/database";

export function sortComments(list: IComment[]) {
  const symbols = ["$", "%", "!", "#", "["].reverse();
  const isSp = (item) => symbols.some((s) => item.text.startsWith(s));
  const shouldSort = list.some(isSp);

  if (shouldSort) {
    return list.sort((a, b) => {
      const aIndex = symbols.indexOf(a.text[0]);
      const bIndex = symbols.indexOf(b.text[0]);

      return aIndex < bIndex ? 1 : -1;
    });
  } else {
    return list;
  }
}
