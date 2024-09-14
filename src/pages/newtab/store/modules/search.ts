import { create } from "zustand";

interface SearchState {
  searchBoxVisible: boolean;
  setSearchBoxVisible: (visible: boolean) => void;
}

const useSearchStore = create<SearchState>((set) => ({
  searchBoxVisible: false,
  setSearchBoxVisible: (visible) => set({ searchBoxVisible: visible }),
}));

export default useSearchStore;
