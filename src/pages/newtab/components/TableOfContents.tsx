import React, { useState, useEffect, useMemo } from "react";
import { loadParagraph } from "../newtab.helper";
import { getChapters } from "@src/server/controller/paragraphController";
import useReaderStore from "../store/modules/reader";

interface TOCItem {
  index: number;
  title: string;
}

const TableOfContents: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const { currentBook, bookLoaded, cursor, setParagraph } = useReaderStore();

  useEffect(() => {
    if (currentBook && bookLoaded) {
      getChapters(currentBook.id).then((res) => {
        if (res.code === 0) {
          setTocItems(res.data.map((p) => ({ index: p.index, title: p.text })));
        }
      });
    }
  }, [currentBook, bookLoaded]);

  const handleTOCItemClick = (index: number) => {
    if (currentBook) {
      loadParagraph(currentBook, index, setParagraph);
      onClose();
    }
  };

  const getCurrentChapterIndex = () => {
    for (let i = tocItems.length - 1; i >= 0; i--) {
      if (tocItems[i].index <= cursor) {
        return tocItems[i].index;
      }
    }
    return -1;
  };

  const currentChapterIndex = useMemo(() => getCurrentChapterIndex(), [cursor, tocItems]);

  return (
    <div className="bg-gray-800 shadow-lg rounded-lg p-6 max-w-md mx-auto">
      <div className="max-h-[60vh] overflow-y-auto">
        <ul className="space-y-2">
          {tocItems.map((item) => (
            <li
              key={item.index}
              onClick={() => handleTOCItemClick(item.index)}
              className={`cursor-pointer hover:bg-gray-700 p-2 rounded transition duration-200 ease-in-out ${
                item.index === currentChapterIndex ? "bg-gray-600" : ""
              }`}
            >
              <span
                className={`${
                  item.index === currentChapterIndex
                    ? "text-white font-bold"
                    : "text-gray-400"
                }`}
              >
                {item.title}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TableOfContents;
