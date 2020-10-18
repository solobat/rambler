import * as React from 'react';
import { useCallback, useContext, useEffect, useReducer } from 'react';
import { ToastContainer } from 'react-toastify';
import { useEventListener } from 'ahooks';

import { APP_ACTIONS } from '../common/constant';
import { onDbUpdate } from '../helper/db.helper';
import { isAutoSync } from '../helper/sync';
import { noticeBg } from '../helper/event';

import TxtUpload from './components/TxtUpload';
import SearchBox from './components/SearchBox';
import TopbarTools from './components/TopbarTools';
import Comments from './components/Comments';
import Paragraph from './components/Paragraph';
import BottombarTools from './components/BottombarTools';

import { keydownEventHandler, initialState, reducer, loadBook, 
    loadParagraph, initBook, ACTIONS, recordCursor, AppContext } from './newtab.helper';

import 'react-toastify/dist/ReactToastify.css'
import 'rc-slider/assets/index.css';
import './newtab.scss';

declare global {
    interface Window { ramblerApi: any; }
}

export default function App() {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <AppContext.Provider value={{state, dispatch}}>
            <div className="newtab-container">
                <TxtUpload />
                <TopbarTools />
                <Container />
                <ToastContainer autoClose={3000} hideProgressBar={true}/>
                <BottombarTools />
            </div>
        </AppContext.Provider>
    )
}

function Container() {
    const {state, dispatch} = useContext(AppContext);
    const { paragraph, allowComment, currentBookId, cursor, currentBook, searchBoxVisible } = state;
    const commentsVisible = paragraph && allowComment;

    useEffect(() => {
        if (currentBookId) {
            loadBook(dispatch, currentBookId);
        }
    }, [currentBookId]);

    useEffect(() => {
        if (currentBook) {
           loadParagraph(dispatch, currentBook, cursor);
           recordCursor(currentBook.id, cursor);
        }
    }, [currentBook, cursor]);
    useEffect(() => {
        dispatch({ type: ACTIONS.RESET_HISTORY });
    }, [currentBook]);
    
    useEffect(() => {
        initBook(dispatch);
    }, []);
    
    const onKeydown = useCallback((event: React.KeyboardEvent) => {
        keydownEventHandler(event, dispatch, currentBook, paragraph);
    }, [currentBook, paragraph])

    useEventListener('keydown', onKeydown, {
        target: document
    });

    useEffect(() => {
        onDbUpdate(() => {
            if (isAutoSync()) {
              noticeBg({
                action: APP_ACTIONS.START_SYNC
              })
            }
        });
    }, []);

    return (
        <>
            { searchBoxVisible ? <SearchBox /> : null }
            { paragraph ? <Paragraph /> : null }
            { commentsVisible ? <Comments /> : null }
        </>
    )
}