import { create } from 'zustand';
import { STORAGE_KEYS } from '../../../../common/constant';

interface CommentsState {
  allowComment: boolean;
  updateAllowComment: (value: boolean) => void;
}

const useCommentsStore = create<CommentsState>((set) => ({
  allowComment: localStorage.getItem(STORAGE_KEYS.ALLOW_COMMENT) === '1',
  updateAllowComment: (value) => {
    localStorage.setItem(STORAGE_KEYS.ALLOW_COMMENT, value ? '1' : '');
    set({ allowComment: value });
  },
}));

export default useCommentsStore;
