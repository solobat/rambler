import * as React from "react";
import { i18nMsg } from "../newtab.helper";
import * as bookController from "../../../server/controller/bookController";
import { SESSION_STORAGE } from "@src/common/constant";
import { sliceFileToParagraphs, ParagraphData } from "@src/util/paragraph";
import useReaderStore from "../store/modules/reader";
import { useToast } from "./Toast";

export default function TxtUpload() {
  const { setCurrentBookId, setCursor } = useReaderStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const paragraphs = await sliceFileToParagraphs(file);
        const resp = await bookController.saveBook(file, paragraphs);

        if (resp.code === 0) {
          const bookId: number = resp.data;

          await bookController.setCurrentBook(bookId);
          window.sessionStorage.setItem(
            SESSION_STORAGE.CURRENT_BOOK_ID,
            String(bookId)
          );
          setCurrentBookId(bookId);
          setCursor(0);

          addToast({
            message: i18nMsg.uploadDone,
            type: "success",
          });
        } else {
          addToast({
            message: resp.message,
            type: "error",
          });
        }
      } catch (error) {
        console.error("上传文件时发生错误:", error);
        addToast({
          message: "上传文件失败，请重试。",
          type: "error",
        });
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative inline-block">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="text/plain"
        className="hidden"
      />
      <button
        onClick={handleClick}
        className="btn btn-outline btn-default opacity-70 hover:opacity-100 btn-sm m-2"
      >
        {i18nMsg.uploadTxt}
      </button>
    </div>
  );
}
