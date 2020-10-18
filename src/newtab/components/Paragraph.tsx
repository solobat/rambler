import * as React from 'react';
import { useContext, useRef, useCallback, useMemo } from 'react';
import { ACTIONS, AppContext, getPureBookName } from '../newtab.helper';
import ShareIcons from "./ShareIcons";
import Slider from 'rc-slider';

export default function Paragraph() {
    const {state, dispatch} = useContext(AppContext);
    const { paragraph, currentBook } = state;
    const paragraphRef = useRef();
    const onSlideChange = useCallback((newIndex) => {
        dispatch({ type: ACTIONS.SET_CURSOR, payload: newIndex });
        dispatch({ type: ACTIONS.ADD_HISTORY, payload: newIndex });
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