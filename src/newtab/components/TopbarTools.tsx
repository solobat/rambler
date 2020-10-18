import * as React from 'react';
import { useCallback, useContext } from "react";
import { useLocalStorageState } from "ahooks";
import { ACTIONS, AppContext, setBgColor } from "../newtab.helper";
import { SOLID_COLORS } from "../../common/constant";

export default function TopbarTools() {
  const { dispatch, state } = useContext(AppContext);
  const { searchBoxVisible } = state;
  const [currentBg, setCurrentBg] = useLocalStorageState('wallpaper', '#5b7e91');
  const onColorChange = (color) => {
      setCurrentBg(color);
      setBgColor(color);
  };
  const onCustomColorEnter = (event) => {
      if (event.key === 'Enter') {
          const color = event.target.value;

          if (color.match(/^#[a-fA-F0-9]{3,6}$/)) {
              onColorChange(color);
          }
      }
  }
  const onSearchBtnClick = useCallback(() => {
      dispatch({ type: ACTIONS.UPDATE_SEARCHBOX_VISIBLE, payload: !searchBoxVisible});
  }, [searchBoxVisible]);

  return (
      <div className="top-right-tools">
          <div className="search-btn" onClick={onSearchBtnClick}>
              <i className="icon-search"></i>
          </div>
          <div className="color-selector">
              <div className="current-color color-box" style={{
                  background: currentBg
              }}></div>
              <div className="color-list">
                  <div className="color-box">
                      <input type="text" className="custom-color" onKeyPress={onCustomColorEnter}/>
                  </div>
                  { SOLID_COLORS.map((color, index) => {
                      return (
                          <div className="color-box" style={{
                              background: color
                          }} key={index} onClick={() => onColorChange(color)}></div>
                      )
                  }) }
              </div>
          </div>                
      </div>
  )
}