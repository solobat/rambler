import { db } from '../db/database'
import Comment from '../model/Comment'

export function save(text: string, bookId: number, paragraphId: number) {
    const comment: Comment = new Comment(bookId, paragraphId, text);
    console.log(comment);

    return db.comments.put(comment);
}
