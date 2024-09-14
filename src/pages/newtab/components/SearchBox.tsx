import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as paragraphController from "../../../server/controller/paragraphController";
import * as Code from "../../../server/common/code";
import { IParagraph } from "../../../server/db/database";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/reducers";
import {
  ADD_HISTORY,
  SET_CURSOR,
  UPDATE_SEARCHBOX_VISIBLE,
} from "../redux/actionTypes";
import { Modal, Input, InputRef } from "antd";

export default function SearchBox() {
  const dispatch = useDispatch();
  const { searchBoxVisible } = useSelector((state: RootState) => state.search);
  const currentBookId = useSelector(
    (state: RootState) => state.readers.currentBookId
  );
  const [keywords, setKeywords] = useState("");
  const searchIptRef = useRef<InputRef>(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [searchResults, setSearchResults] = useState<IParagraph[]>([]);

  useEffect(() => {
    if (searchBoxVisible && searchIptRef.current) {
      searchIptRef.current.focus();
    }
  }, [searchBoxVisible]);

  const onSearchBoxInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (timer) clearTimeout(timer);
    const text = event.target.value;

    const newTimer = setTimeout(() => {
      paragraphController.search(currentBookId, text).then((resp) => {
        if (resp.code === Code.OK.code) {
          setSearchResults(resp.data);
        } else {
          setSearchResults([]);
        }
      });
    }, 300);
    setTimer(newTimer);
  };

  const onSearchResultClick = useCallback((result: IParagraph) => {
    dispatch({ type: UPDATE_SEARCHBOX_VISIBLE, payload: false });
    dispatch({ type: SET_CURSOR, payload: result.index });
    dispatch({ type: ADD_HISTORY, payload: result.index });
  }, []);

  const handleCancel = () => {
    dispatch({ type: UPDATE_SEARCHBOX_VISIBLE, payload: false });
  };

  return (
    <Modal
      title="搜索"
      open={searchBoxVisible}
      onCancel={handleCancel}
      footer={null}
    >
      <Input
        defaultValue={keywords}
        ref={searchIptRef}
        onChange={onSearchBoxInput}
        onKeyDown={(e) => e.stopPropagation()}
      />
      <div className="search-results max-h-60 overflow-y-auto mt-4">
        {searchResults.map((result, index) => (
          <div
            className="result-item cursor-pointer hover:bg-gray-500 p-2"
            key={index}
            onClick={() => onSearchResultClick(result)}
          >
            {result.text}
          </div>
        ))}
      </div>
    </Modal>
  );
}
