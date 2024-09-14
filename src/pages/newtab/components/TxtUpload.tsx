import * as React from "react";
import { i18nMsg } from "../newtab.helper";
import * as bookController from "../../../server/controller/bookController";
import { message } from "antd";
import Upload from "rc-upload";
import { SESSION_STORAGE } from "@src/common/constant";
import { sliceFileToParagraphs, ParagraphData } from "@src/util/paragraph";
import useReaderStore from "../store/modules/reader";

export default function TxtUpload() {
  const { setCurrentBookId, setCursor } = useReaderStore();

  const uploaderProps = {
    accept: "text/plain",
    beforeUpload(file) {
      sliceFileToParagraphs(file).then((resp: ParagraphData[]) => {
        bookController.saveBook(file, resp).then((resp) => {
          if (resp.code === 0) {
            const bookId: number = resp.data;

            bookController.setCurrentBook(bookId);
            window.sessionStorage.setItem(
              SESSION_STORAGE.CURRENT_BOOK_ID,
              String(bookId)
            );
            setCurrentBookId(bookId);
            setCursor(0);

            message.success(i18nMsg.uploadDone);
          } else {
            message.error(resp.message);
          }
        });
      });

      return false;
    },
  };

  return (
    <Upload {...uploaderProps} className="file-uploader">
      <a>{i18nMsg.uploadTxt}</a>
    </Upload>
  );
}
