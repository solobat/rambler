import * as React from 'react';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { i18nMsg } from '../newtab.helper';
import * as commentController from '../../server/controller/commentController';
import * as Code from '../../server/common/code';
import { toast } from 'react-toastify';
import { IComment, IParagraph } from '../../server/db/database';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/reducers';

export default function Comments() {
  const { currentBookId, paragraph } = useSelector((state: RootState) => state.readers);
  const commentIptRef = useRef<HTMLInputElement>();
  const [comments, setComments] = useState<IComment[]>([]);
  const onCommentBoxMouseEnter = useCallback(() => {
    commentIptRef.current.focus();
  }, []);
  const onCommentBoxMouseLeave = useCallback(() => {
    commentIptRef.current.blur();
  }, []);
  const onCommentInputKeyPress = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        const trimedCommentText = event.target.value.trim();

        if (trimedCommentText) {
          event.target.value = '';
          commentController.saveComment(trimedCommentText, currentBookId, paragraph.id).then((resp) => {
            if (resp.code === Code.OK.code) {
              console.log('save successfully');
              loadComments(setComments, currentBookId, paragraph);
            } else {
              toast.error(resp.message);
            }
          });
        }
      }
    },
    [currentBookId, paragraph],
  );

  useEffect(() => {
    loadComments(setComments, currentBookId, paragraph);
  }, [currentBookId, paragraph]);

  return (
    <div className="comment-container" onMouseEnter={() => onCommentBoxMouseEnter()} onMouseLeave={() => onCommentBoxMouseLeave()}>
      <div className="comment-input-box">
        <input type="text" ref={commentIptRef} placeholder={i18nMsg.commentHere} onKeyPress={onCommentInputKeyPress} />
      </div>
      <div className="comments">
        {comments.map((comment, index) => {
          return <Comment key={index} comment={comment} />;
        })}
      </div>
    </div>
  );
}

interface CommentProps {
  comment: IComment;
}

function Comment(props: CommentProps) {
  const { comment } = props;

  return <div className="comment-item">{comment.text}</div>;
}

function loadComments(setComments: React.Dispatch<React.SetStateAction<IComment[]>>,
  currentBookId: number, paragraph: IParagraph) {
  commentController.queryByParagraph(currentBookId, paragraph.id).then((resp) => {
    if (resp.code === Code.OK.code) {
      if (resp.data) {
        const comments = resp.data;

        setComments(comments);
      }
    } else {
      toast.error(resp.message);
    }
  });
}