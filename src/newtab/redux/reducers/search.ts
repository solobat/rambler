import { UPDATE_SEARCHBOX_VISIBLE } from "../actionTypes";
import { Action, SearchState } from "../types";

const initialState: SearchState = {
  searchBoxVisible: false,
};

export default function(state = initialState, action: Action) {
  switch (action.type) {
    case UPDATE_SEARCHBOX_VISIBLE:
          state.searchBoxVisible = action.payload;
          return {...state};
    default:
      return state;
  }
}
