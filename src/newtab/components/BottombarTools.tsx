import * as React from 'react';
import { useContext, useCallback } from 'react';
import { CommentOutlined } from '@ant-design/icons';
import { ACTIONS, AppContext } from '../newtab.helper';

export default function BottombarTools() {
  const { state, dispatch } = useContext(AppContext);
  const { allowComment } = state;
  const onCommentBtnClick = useCallback(() => {
      dispatch({
          type: ACTIONS.UPDATE_ALLOW_COMMENT,
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
