import { UPDATE_ALLOW_COMMENT } from "../actionTypes";
import { Action, CommentsState } from "../types";

const initialState: CommentsState = {
  allowComment: false,
};

export default function(state = initialState, action: Action) {
  switch (action.type) {
    case UPDATE_ALLOW_COMMENT:
          state.allowComment = action.payload;
          return {...state};
    default:
      return state;
  }
}
