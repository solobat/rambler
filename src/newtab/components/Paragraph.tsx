import * as React from 'react';
import { useContext, useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { getPureBookName } from '../newtab.helper';
import ShareIcons from './ShareIcons';
import Slider from 'rc-slider';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/reducers';
import { ADD_HISTORY, SET_CURSOR, UPDATE_PARAGRAH_TEXT } from '../redux/actionTypes';
import { CheckOutlined, CloseOutlined, FormOutlined } from '@ant-design/icons';
import Input from 'antd/es/input';
import useEditBtn from '../../hooks/useEditBtn';
import { updateParagraphText } from '../redux/actions/reader';

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
  const onEditDone = useCallback((newText) => {
    dispatch(updateParagraphText(paragraph.id, newText));
  }, [paragraph.id]);
  const { editing, textEditing, onEditStart,
    onEditDoneClick, onEditCancel, onTextChange } = useEditBtn(text, onEditDone);

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
      <div className="paragraph-tools">
        {
          editing ? 
          <>
            <CheckOutlined className="icon icon-edit-done" onClick={onEditDoneClick}/>
            <CloseOutlined className="icon icon-edit-cancel" onClick={onEditCancel}/>
          </> :
          <FormOutlined className="icon icon-edit-start" onClick={onEditStart}/>
        }
      </div>
      <div className="paragraph-text" ref={paragraphRef}>
        {
          editing ? 
          <Input.TextArea value={textEditing} onChange={onTextChange} /> :
          <>{text}</>
        }
      </div>
      <p className="book-name">{currentBook ? `-- ${pureBookName}` : ''}</p>
      <ShareIcons />
    </div>
  );
}
