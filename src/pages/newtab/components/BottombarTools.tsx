import { useCallback } from "react";
import {
  CommentOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  MacCommandOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useFullscreen } from "ahooks";
import useCommentsStore from "../store/modules/comments";
import useSearchStore from "../store/modules/search";
import useReaderStore from "../store/modules/reader";

export default function BottombarTools() {
  const { allowComment, updateAllowComment } = useCommentsStore();
  const { searchBoxVisible, setSearchBoxVisible } = useSearchStore();
  const { setShortcutsModalVisible } = useReaderStore();
  const [isFullscreen, { toggleFull }] = useFullscreen(
    document.documentElement
  );

  const onCommentBtnClick = useCallback(() => {
    updateAllowComment(!allowComment);
  }, [allowComment, updateAllowComment]);

  const onShortcutsBtnClick = useCallback(() => {
    setShortcutsModalVisible(true);
  }, [setShortcutsModalVisible]);

  const onSearchBtnClick = useCallback(() => {
    setSearchBoxVisible(!searchBoxVisible);
  }, [searchBoxVisible, setSearchBoxVisible]);

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
