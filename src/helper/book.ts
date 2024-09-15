import { queryByBook } from "../server/service/commentService";
import { download } from "./db.helper";

export async function exportCommentsAsTxt(bookId: number): Promise<void> {
  const comments = await queryByBook(bookId);
  const content = comments
    .map((comment) => {
      const date = new Date(comment.createTime).toISOString().split("T")[0];
      return `${date}: ${comment.text}`;
    })
    .join("\n");

  const fileName = `comments_${bookId}.txt`;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });

  download(blob, fileName, "text/plain;charset=utf-8");
}
