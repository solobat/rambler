import * as React from 'react';
import { useContext, useRef, useCallback, useMemo } from 'react';
import { getPureBookName } from '../newtab.helper';
import ShareIcons from './ShareIcons';
import Slider from 'rc-slider';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/reducers';
import { ADD_HISTORY, SET_CURSOR } from '../redux/actionTypes';

export default function Paragraph() {
  const dispatch = useDispatch();
  const { paragraph, currentBook, cursor } = useSelector((state: RootState) => state.readers);
  const paragraphRef = useRef();
  const onSlideChange = useCallback((newIndex) => {
    dispatch({ type: SET_CURSOR, payload: newIndex });
    dispatch({ type: ADD_HISTORY, payload: newIndex });
  }, []);
  const pureBookName = useMemo(() => {
    return getPureBookName(false, currentBook);
  }, [currentBook]);
  const text = useMemo(() => {
    return (paragraph.text || '').trim()
  }, [paragraph.text])

  return (
    <div className="paragraph-container">
      <div className="process">
        <Slider
          defaultValue={paragraph.index}
          value={cursor}
          min={0}
          max={currentBook.paragraphCount}
          onChange={onSlideChange}
          railStyle={{
            height: '2px',
            borderRadius: '0',
          }}
          trackStyle={{
            height: '2px',
            borderRadius: '0',
          }}
          handleStyle={{
            borderRadius: '0',
          }}
        />
      </div>
      <p className="paragraph-text" ref={paragraphRef}>
        {text}
      </p>
      <p className="book-name">{currentBook ? `-- ${pureBookName}` : ''}</p>
      <ShareIcons />
    </div>
  );
}
