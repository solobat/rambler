import { create } from "zustand";
import { getBookFilter } from "@src/util/storage";
import { IBook, IParagraph } from "../../../../server/db/database";
import { updateText } from "../../../../server/controller/paragraphController";

interface ReaderState {
  bookLoaded: boolean;
  currentBookId: number;
  editing: boolean;
  currentBook: IBook | null;
  paragraph: IParagraph | null;
  cursor: number;
  history: number[];
  shortcutsModalVisible: boolean;
  spanCursor: number;
  filter: boolean;
  setCurrentBookId: (id: number) => void;
  setCurrentBook: (book: IBook) => void;
  setParagraph: (paragraph: IParagraph) => void;
  setCursor: (cursor: number) => void;
  setEditing: (editing: boolean) => void;
  incCursor: () => void;
  setSpanCursor: (spanCursor: number) => void;
  setFilter: (filter: boolean) => void;
  resetHistory: () => void;
  addHistory: (item: number) => void;
  setShortcutsModalVisible: (visible: boolean) => void;
  setBookLoaded: (loaded: boolean) => void;
  updateParagraphText: (id: number, newText: string) => Promise<void>;
}

const MAX_HISTORY_LENGTH = 1024;

const useReaderStore = create<ReaderState>((set, get) => ({
  bookLoaded: false,
  currentBookId: 0,
  editing: false,
  currentBook: null,
  paragraph: null,
  cursor: 0,
  history: [],
  shortcutsModalVisible: false,
  spanCursor: -1,
  filter: getBookFilter(),

  setCurrentBookId: (id) => set({ currentBookId: id }),
  setCurrentBook: (book) => set({ currentBook: book }),
  setParagraph: (paragraph) => set({ paragraph }),
  setCursor: (cursor) => set({ cursor, spanCursor: -1 }),
  setEditing: (editing) => set({ editing }),
  incCursor: () =>
    set((state) => ({ cursor: state.cursor + 1, spanCursor: 0 })),
  setSpanCursor: (spanCursor) => set({ spanCursor }),
  setFilter: (filter) => set({ filter }),
  resetHistory: () => set({ history: [] }),
  addHistory: (item) =>
    set((state) => {
      const newHistory = [...state.history];
      if (newHistory.length >= MAX_HISTORY_LENGTH) {
        newHistory.shift();
      }
      newHistory.push(item);
      return { history: newHistory };
    }),
  setShortcutsModalVisible: (visible) =>
    set({ shortcutsModalVisible: visible }),
  setBookLoaded: (loaded) => set({ bookLoaded: loaded }),
  updateParagraphText: async (id, newText) => {
    await updateText(id, newText);
    set((state) => ({
      paragraph: state.paragraph ? { ...state.paragraph, text: newText } : null,
    }));
  },
}));

export default useReaderStore;
