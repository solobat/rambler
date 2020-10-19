import { combineReducers } from "redux";
import readers from './reader';
import search from './search';
import comments from './comments';

export const rootReducer = combineReducers({ readers, search, comments });

export type RootState = ReturnType<typeof rootReducer>
