import { useCallback } from "react";
import { useFullscreen } from "ahooks";
import useCommentsStore from "../store/modules/comments";
import useSearchStore from "../store/modules/search";
import useReaderStore from "../store/modules/reader";
import { exportCommentsAsTxt } from "@src/helper/book";
import {
  IconComment,
  IconShortcuts,
  IconFullscreen,
  IconSearch,
  IconExport,
} from "@src/assets/Icons";

export default function BottombarTools() {
  const { allowComment, updateAllowComment } = useCommentsStore();
  const { searchBoxVisible, setSearchBoxVisible } = useSearchStore();
  const { setShortcutsModalVisible, currentBookId } = useReaderStore();
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

  const onExportBtnClick = useCallback(() => {
    exportCommentsAsTxt(currentBookId);
  }, [currentBookId]);

  return (
    <div className="bottom-right-tools">
      <IconComment
        className={`icon icon-comment ${
          allowComment ? "icon-comment-enable" : "icon-comment-disable"
        }`}
        onClick={onCommentBtnClick}
      />
      <IconShortcuts onClick={onShortcutsBtnClick} />
      <IconFullscreen isFullscreen={isFullscreen} onClick={toggleFull} />
      <IconSearch onClick={onSearchBtnClick} />
      <IconExport onClick={onExportBtnClick} />
    </div>
  );
}
