import * as React from 'react';
import { useCallback, useContext } from "react";
import { useLocalStorageState } from "ahooks";
import { setBgColor } from "../newtab.helper";
import { SOLID_COLORS } from "../../common/constant";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/reducers';
import { UPDATE_SEARCHBOX_VISIBLE } from '../redux/actionTypes';

export default function TopbarTools() {
  const dispatch = useDispatch();
  const searchBoxVisible = useSelector((state: RootState) => state.search.searchBoxVisible);
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
      dispatch({ type: UPDATE_SEARCHBOX_VISIBLE, payload: !searchBoxVisible});
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