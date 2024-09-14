import { useState, useRef, useCallback } from 'react';
import useReaderStore from '@src/pages/newtab/store/modules/reader';

export default function useEditBtn(defaultText = '', onDone) {
  const { editing, setEditing } = useReaderStore();
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const [text, setText] = useState(defaultText);

  const onEditStart = useCallback(() => {
    setText(defaultText);
    setEditing(true);
  }, [defaultText, setEditing]);

  const onEditDoneClick = useCallback(() => {
    setEditing(false);
    onDoneRef.current(text);
  }, [text, setEditing]);

  const onEditCancel = useCallback(() => {
    setEditing(false);
    setText(defaultText);
  }, [defaultText, setEditing]);

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