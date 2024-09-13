import * as React from "react";
import { useContext } from "react";
import { i18nMsg } from "../newtab.helper";
import * as bookController from "../../../server/controller/bookController";
import { message } from "antd";
import Upload from "rc-upload";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/reducers";
import { SET_CURRENT_BOOKID, SET_CURSOR } from "../redux/actionTypes";
import { SESSION_STORAGE } from "@src/common/constant";
import { sliceFileToParagraphs, ParagraphData } from "@src/util/paragraph";

export default function TxtUpload() {
  const dispatch = useDispatch();
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
            dispatch({ type: SET_CURRENT_BOOKID, payload: bookId });
            dispatch({ type: SET_CURSOR, payload: 0 });

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
