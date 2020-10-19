import * as React from 'react';
import { useContext, useRef, useCallback, useMemo } from 'react';
import { getPureBookName } from '../newtab.helper';
import ShareIcons from "./ShareIcons";
import Slider from 'rc-slider';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/reducers';
import { ADD_HISTORY, SET_CURSOR } from '../redux/actionTypes';

export default function Paragraph() {
    const dispatch = useDispatch();
    const { paragraph, currentBook } = useSelector((state: RootState) => state.readers);
    const paragraphRef = useRef();
    const onSlideChange = useCallback((newIndex) => {
        dispatch({ type: SET_CURSOR, payload: newIndex });
        dispatch({ type: ADD_HISTORY, payload: newIndex });
    }, []);
    const pureBookName = useMemo(() => {
        return getPureBookName(false, currentBook);
    }, [currentBook]);
    
    return (
        <div className="paragraph-container">
            <div className="process">
                <Slider defaultValue={paragraph.index}
                    min={0} max={currentBook.paragraphCount}
                    onAfterChange={onSlideChange}
                    railStyle={{
                        height: '2px',
                        borderRadius: '0'
                    }}
                    trackStyle={{
                        height:'2px',
                        borderRadius: '0'
                    }}
                    handleStyle={{
                        borderRadius: '0'
                    }}/>
            </div>
            <p className="paragraph-text" ref={paragraphRef}>{ paragraph.text }</p>
            <p className="book-name">{ currentBook ? `-- ${pureBookName}` : '' }</p>
            <ShareIcons />
        </div>
    )
}