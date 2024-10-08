import Modal from "./Modal";
import * as React from "react";
import { useCallback } from "react";
import useReaderStore from "../store/modules/reader";

interface KeyItemType {
  label: string;
  value: string[];
  type: "multiple" | "";
}

const keyItems: KeyItemType[] = [
  { label: "Refresh", value: ["r"], type: "" },
  { label: "Prev Paragraph", value: ["←", "↑", "h"], type: "multiple" },
  { label: "Next Paragraph", value: ["→", "↓", "l"], type: "multiple" },
  { label: "Prev Clause", value: ["k"], type: "multiple" },
  { label: "Next Clause", value: ["j"], type: "multiple" },
  { label: "Open Searchbox", value: ["f"], type: "" },
  { label: "Close Searchbox", value: ["esc"], type: "" },
];

export default function ShortcutsModal() {
  const { shortcutsModalVisible, setShortcutsModalVisible } = useReaderStore();

  const onCancel = useCallback(() => {
    setShortcutsModalVisible(false);
  }, [setShortcutsModalVisible]);

  return (
    <Modal title="Shortcuts" isOpen={shortcutsModalVisible} onClose={onCancel}>
      <div className="flex flex-col gap-2">
        {keyItems.map((item, index) => (
          <KeyItem key={index} item={item} />
        ))}
      </div>
    </Modal>
  );
}

interface KeyItemPropsType {
  item: KeyItemType;
}

function KeyItem(props: KeyItemPropsType) {
  const { value, label, type } = props.item;

  return (
    <p className="shortcut-item">
      {value.map((item, idx) => (
        <span key={idx} className="key-item">
          {item}
        </span>
      ))}
      <span className="shortcut-label">{label}</span>
    </p>
  );
}
