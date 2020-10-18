import * as React from 'react';
import { useContext } from "react";
import { sliceFileToParagraphs } from "../../util/file";
import { ACTIONS, AppContext, i18nMsg } from "../newtab.helper";
import * as bookController from '../../server/controller/bookController';
import { toast } from 'react-toastify';
import Upload from 'rc-upload';

export default function TxtUpload() {
  const { dispatch } = useContext(AppContext);
  const uploaderProps = {
      accept: 'text/plain',
      beforeUpload(file) {
        sliceFileToParagraphs(file).then((resp: string[]) => {
          bookController.saveBook(file, resp).then(resp => {
              if (resp.code === 0) {
                  const bookId: number = resp.data;
  
                  bookController.setCurrentBook(bookId);
                  dispatch({ type: ACTIONS.SET_CURRENT_BOOKID, payload: bookId })
                  dispatch({ type: ACTIONS.SET_CURSOR, payload: 0 })
  
                  toast.success(i18nMsg.uploadDone);
              } else {
                  toast.error(resp.message);
              }
          });
        });
        
        return false;
      }
  }

  return (
      <Upload {...uploaderProps} className="file-uploader">
          <a>{i18nMsg.uploadTxt}</a>
      </Upload>
  )
}