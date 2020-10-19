import * as React from 'react';
import { useContext, useCallback } from 'react';
import { CommentOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/reducers';
import { UPDATE_ALLOW_COMMENT } from '../redux/actionTypes';

export default function BottombarTools() {
  const dispatch = useDispatch();
  const allowComment = useSelector((state: RootState) => state.comments.allowComment);
  const onCommentBtnClick = useCallback(() => {
      dispatch({
          type: UPDATE_ALLOW_COMMENT,
          payload: !allowComment
      });
  }, [allowComment]);

  return (
      <div className="bottom-right-tools">
          <CommentOutlined style={{color: "#fff", fontSize: "20px"}}
              className={["icon-comment", allowComment ? 'icon-comment-enable' : 'icon-comment-disable'].join(' ')}
              onClick={onCommentBtnClick} />
      </div>
  )
}
