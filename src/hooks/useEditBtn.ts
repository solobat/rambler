import { useBoolean } from 'ahooks';
import { useContext, useState, useRef, useCallback, useMemo, useEffect } from 'react';

export default function useEditBtn(defaultText = '', onDone) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const [editing, {setTrue, setFalse}] = useBoolean(false);
  const [text, setText] = useState(defaultText);
  const onEditStart = useCallback(() => {
    setText(defaultText);
    setTrue();
  }, [defaultText]);
  const onEditDoneClick = useCallback(() => {
    setFalse();
    onDoneRef.current(text);
  }, [text]);
  const onEditCancel = useCallback(() => {
    setFalse();
    setText(defaultText);
  }, [defaultText]);
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