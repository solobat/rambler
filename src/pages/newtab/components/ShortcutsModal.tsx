import Modal from 'antd/lib/modal/Modal';
import * as React from 'react';
import { useContext, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { SET_SHORTCUTS_MODAL_VISIBLE } from '../redux/actionTypes';
import { RootState } from '../redux/reducers';

interface KeyItemType {
  label: string;
  value: string[];
  type: 'multiple' | '';
}

const keyItems: KeyItemType[] = [
  { label: 'Refresh', value: ['r'], type: '' },
  { label: 'Prev Paragraph', value: ['←', '↑', 'h'], type: 'multiple'},
  { label: 'Next Paragraph', value: ['→', '↓', 'l'], type: 'multiple'},
  { label: 'Prev Clause', value: ['k'], type: 'multiple'},
  { label: 'Next Clause', value: ['j'], type: 'multiple'},
  { label: 'Open Searchbox', value: ['f'], type: ''},
  { label: 'Close Searchbox', value: ['esc'], type: ''},
]

export default function ShortcutsModal() {
  const visible = useSelector((state: RootState) => state.readers.shortcutsModalVisible);
  const dispatch = useDispatch();
  const onCancel = useCallback(() => {
    dispatch({
      type: SET_SHORTCUTS_MODAL_VISIBLE,
      payload: false
    })
  }, []);

  return (
    <Modal
      title="Shortcuts"
      closable={false}
      footer={null}
      visible={visible}
      onCancel={onCancel}
      >
      { keyItems.map((item, index) => <KeyItem  key={index} item={item} /> )}
    </Modal>
  )
}

interface KeyItemPropsType {
  item: KeyItemType
}

function KeyItem(props: KeyItemPropsType) {
  const { value, label, type } = props.item;

  return (
    <p className="shortcut-item">
      {
        value.map((item, idx) => <span key={idx} className="key-item">{item}</span>)
      }
      <span className="shortcut-label">{label}</span>
    </p>
  )
}