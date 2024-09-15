import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as paragraphController from "../../../server/controller/paragraphController";
import * as Code from "../../../server/common/code";
import { IParagraph } from "../../../server/db/database";
import useSearchStore from "../store/modules/search";
import useReaderStore from "../store/modules/reader";
import Modal from "./Modal";

export default function SearchBox() {
  const { searchBoxVisible, setSearchBoxVisible } = useSearchStore();
  const { currentBookId, setCursor, addHistory } = useReaderStore();
  const [keywords, setKeywords] = useState("");
  const searchIptRef = useRef<HTMLInputElement>(null);
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

  const onSearchResultClick = useCallback(
    (result: IParagraph) => {
      setSearchBoxVisible(false);
      setCursor(result.index);
      addHistory(result.index);
    },
    [setSearchBoxVisible, setCursor, addHistory]
  );

  const handleCancel = () => {
    setSearchBoxVisible(false);
  };

  return (
    <Modal title="搜索" isOpen={searchBoxVisible} onClose={handleCancel}>
      <input
        type="text"
        defaultValue={keywords}
        ref={searchIptRef}
        onChange={onSearchBoxInput}
        onKeyDown={(e) => e.stopPropagation()}
        className="input input-bordered w-full"
      />
      <div className="search-results max-h-60 overflow-y-auto mt-4">
        {searchResults.map((result, index) => (
          <div
            className="result-item cursor-pointer hover:bg-base-300 p-2"
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
