import { SET_EDITING } from '@src/pages/newtab/redux/actionTypes';
import { RootState } from '@src/pages/newtab/redux/reducers';
import { useBoolean } from 'ahooks';
import { useContext, useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function useEditBtn(defaultText = '', onDone) {
  const dispatch = useDispatch();
  const { editing } = useSelector((state: RootState) => state.readers); 
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const [text, setText] = useState(defaultText);
  const onEditStart = useCallback(() => {
    setText(defaultText);
    dispatch({ type: SET_EDITING, payload: true});
  }, [defaultText, dispatch]);
  const onEditDoneClick = useCallback(() => {
    dispatch({ type: SET_EDITING, payload: false});
    onDoneRef.current(text);
  }, [text, dispatch]);
  const onEditCancel = useCallback(() => {
    dispatch({ type: SET_EDITING, payload: false});
    setText(defaultText);
  }, [defaultText, dispatch]);
  const onTextChange = useCallback((e) => {
    setText(e.target.value);
  }, []);

  return {
    editing,
    textEditing: text,
    onEditStart,
    onEditDoneClick,
    onEditCancel,
    onTextChange
  }
}