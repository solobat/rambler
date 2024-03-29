import { useCallback } from "react";
import {
  CommentOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  MacCommandOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/reducers";
import {
  SET_SHORTCUTS_MODAL_VISIBLE,
  UPDATE_ALLOW_COMMENT,
  UPDATE_SEARCHBOX_VISIBLE,
} from "../redux/actionTypes";
import { useFullscreen } from "ahooks";

export default function BottombarTools() {
  const dispatch = useDispatch();
  const allowComment = useSelector(
    (state: RootState) => state.comments.allowComment
  );
  const [isFullscreen, { toggleFull }] = useFullscreen(
    document.documentElement
  );
  const onCommentBtnClick = useCallback(() => {
    dispatch({
      type: UPDATE_ALLOW_COMMENT,
      payload: !allowComment,
    });
  }, [allowComment]);
  const onShortcutsBtnClick = useCallback(() => {
    dispatch({
      type: SET_SHORTCUTS_MODAL_VISIBLE,
      payload: true,
    });
  }, []);
  const searchBoxVisible = useSelector(
    (state: RootState) => state.search.searchBoxVisible
  );

  const onSearchBtnClick = useCallback(() => {
    dispatch({ type: UPDATE_SEARCHBOX_VISIBLE, payload: !searchBoxVisible });
  }, [searchBoxVisible]);

  return (
    <div className="bottom-right-tools">
      <CommentOutlined
        style={{ color: "#fff", fontSize: "20px" }}
        className={[
          "icon icon-comment",
          allowComment ? "icon-comment-enable" : "icon-comment-disable",
        ].join(" ")}
        onClick={onCommentBtnClick}
      />
      <MacCommandOutlined
        className="icon icon-shortcuts"
        onClick={onShortcutsBtnClick}
      />
      {isFullscreen ? (
        <FullscreenExitOutlined
          className="icon icon-fullscreen"
          onClick={toggleFull}
        />
      ) : (
        <FullscreenOutlined
          className="icon icon-fullscreen"
          onClick={toggleFull}
        />
      )}
      <SearchOutlined className="icon icon-search" onClick={onSearchBtnClick} />
    </div>
  );
}
