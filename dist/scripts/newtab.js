(function() {
    function getBg() {
        return localStorage.getItem('wallpaper');
    }

    const defaultTheme = {
        '--app-newtab-background-image': '#5b7e91',
        '--newtab-background-color': '#5b7e91'
    }

    function initTheme() {
        const themesStr = window.localStorage.getItem('themes');

        if (themesStr) {
            const theme = JSON.parse(themesStr);

            if (theme) {
                
                const bg = getBg();

                if (bg.startsWith('#')) {
                    theme['--app-newtab-background-image'] = bg;
                    theme['--newtab-background-color'] = bg;
                } else {
                    theme['--app-newtab-background-image'] = `url(${bg})`;
                }

                applyTheme(theme);
            }
        } else {
            window.localStorage.setItem('themes', JSON.stringify(defaultTheme));
            applyTheme(defaultTheme);
        }
    }

    function applyTheme(theme) {
        let cssText = '';
                
        for (const prop in theme) {
            cssText += `${prop}: ${theme[prop]};`;
        }

        document.querySelector('html').style.cssText = cssText;
    }

    initTheme();

    window.ramblerApi = {
        initTheme,
        applyTheme
    }
})();