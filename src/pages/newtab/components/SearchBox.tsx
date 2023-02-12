import * as React from 'react';
import { useCallback, useContext, useRef, useState } from 'react';
import * as paragraphController from '../../../server/controller/paragraphController';
import * as Code from '../../../server/common/code';
import { IParagraph } from '../../../server/db/database';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/reducers';
import { ADD_HISTORY, SET_CURSOR, UPDATE_SEARCHBOX_VISIBLE } from '../redux/actionTypes';

export default function SearchBox() {
  const dispatch = useDispatch();
  const currentBookId = useSelector((state: RootState) => state.readers.currentBookId);
  const [keywords, setKeywords] = useState('');
  const searchIptRef = useRef();
  const [timer, setTimer] = useState(0);
  const [searchResults, setSearchResults] = useState([]);

  const onSearchBoxInput = (event) => {
    clearTimeout(timer);
    const text = event.target.value;

    let t = setTimeout(() => {
      paragraphController.search(currentBookId, text).then((resp) => {
        if (resp.code === Code.OK.code) {
          setSearchResults(resp.data);
        } else {
          setSearchResults([]);
        }
      });
    }, 300);
    setTimer(t as any);
  };
  const onSearchResultClick = useCallback((result: IParagraph) => {
    dispatch({ type: UPDATE_SEARCHBOX_VISIBLE, payload: false });
    dispatch({ type: SET_CURSOR, payload: result.index });
    dispatch({ type: ADD_HISTORY, payload: result.index });
  }, []);

  return (
    <div className="search-box">
      <input type="text" defaultValue={keywords} ref={searchIptRef} autoFocus onInput={onSearchBoxInput} />
      <div className="search-results">
        {searchResults.map((result, index) => {
          return (
            <div className="result-item" key={index} onClick={() => onSearchResultClick(result)}>
              {result.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
