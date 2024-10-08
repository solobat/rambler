import packageJson from "./package.json";

const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: "__MSG_extName__",
  version: packageJson.version,
  description: "__MSG_extDesc__",
  default_locale: "en",
  chrome_url_overrides: {
    newtab: "src/pages/newtab/index.html",
  },
  action: {
    default_popup: "src/pages/popup/index.html",
    default_icon: "icon16.png",
  },
  icons: {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png",
  },
  permissions: ["storage"],
  web_accessible_resources: [
    {
      resources: [
        "assets/js/*.js",
        "assets/css/*.css",
        "img/*.png",
        "img/icon/*.svg",
        "icon16.png",
        "icon48.png",
      ],
      matches: ["*://*/*"],
    },
  ],
};

export default manifest;
