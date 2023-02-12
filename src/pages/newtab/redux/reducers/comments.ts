import { STORAGE_KEYS } from '../../../../common/constant';
import { UPDATE_ALLOW_COMMENT } from '../actionTypes';
import { Action, CommentsState } from '../types';

const initialState: CommentsState = {
  allowComment: localStorage.getItem(STORAGE_KEYS.ALLOW_COMMENT) === '1',
};

export default function (state = initialState, action: Action) {
  switch (action.type) {
    case UPDATE_ALLOW_COMMENT:
      state.allowComment = action.payload;
      localStorage.setItem(STORAGE_KEYS.ALLOW_COMMENT, action.payload ? '1' : '');
      return { ...state };
    default:
      return state;
  }
}
