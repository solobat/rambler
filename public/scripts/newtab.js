(function () {
  function getBg() {
    return localStorage.getItem("wallpaper") || "#5b7e91";
  }

  function getMode() {
    return localStorage.getItem("mode") || "read";
  }

  const defaultTheme = {
    "--app-newtab-background-image": "#5b7e91",
    "--newtab-background-color": "#5b7e91",
  };

  function initTheme() {
    const themesStr = window.localStorage.getItem("themes");

    if (themesStr) {
      const theme = JSON.parse(themesStr);

      if (theme) {
        const bg = getBg();

        if (bg.startsWith("#")) {
          theme["--app-newtab-background-image"] = bg;
          theme["--newtab-background-color"] = bg;
        } else {
          theme["--app-newtab-background-image"] = `url(${bg})`;
        }

        applyTheme(theme);
      }
    } else {
      window.localStorage.setItem("themes", JSON.stringify(defaultTheme));
      window.localStorage.setItem("wallpaper", "#5b7e91");

      applyTheme(defaultTheme);
    }
  }

  function applyTheme(theme) {
    let cssText = "";

    for (const prop in theme) {
      cssText += `${prop}: ${theme[prop]};`;
    }

    document.querySelector("html").style.cssText = cssText;
  }

  function updateMode() {
    document.documentElement.className = `mode-${getMode()}`;
  }

  initTheme();
  updateMode();

  window.ramblerApi = {
    initTheme,
    applyTheme,
    updateMode,
  };
})();
