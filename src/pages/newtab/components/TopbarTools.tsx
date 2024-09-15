import * as React from "react";
import { getMode, NewtabMode, setBgColor, setMode } from "../newtab.helper";
import { SOLID_COLORS } from "../../../common/constant";
import { SettingIcon, ReadIcon } from "@src/assets/Icons";

export default function TopbarTools() {
  return (
    <div className="top-right-tools">
      <ColorSelector />
      <ModeBtn />
    </div>
  );
}

function ColorSelector() {
  let currentBg = localStorage.getItem("wallpaper") || "#5b7e91";
  const onColorChange = (color) => {
    currentBg = color;
    setBgColor(color);
  };
  const onCustomColorEnter = (event) => {
    if (event.key === "Enter") {
      const color = event.target.value;

      if (color.match(/^#[a-fA-F0-9]{3,6}$/)) {
        onColorChange(color);
      }
    }
  };

  return (
    <div className="color-selector">
      <div
        className="current-color color-box"
        style={{
          background: currentBg,
        }}
      ></div>
      <div className="color-list">
        <div className="color-box">
          <input
            type="text"
            className="custom-color"
            onKeyPress={onCustomColorEnter}
          />
        </div>
        {SOLID_COLORS.map((color, index) => {
          return (
            <div
              className="color-box"
              style={{
                background: color,
              }}
              key={index}
              onClick={() => onColorChange(color)}
            ></div>
          );
        })}
      </div>
    </div>
  );
}

function ModeBtn() {
  let [mode, updateMode] = React.useState(getMode());

  function onClick(newMode: NewtabMode) {
    setMode(newMode);
    updateMode(newMode);
  }

  return (
    <>
      {mode === "read" ? (
        <SettingIcon
          className="icon icon-mode icon-mode-read"
          onClick={() => onClick("setting")}
        />
      ) : (
        <ReadIcon
          className="icon icon-mode icon-mode-setting"
          onClick={() => onClick("read")}
        />
      )}
    </>
  );
}
