import packageJson from "./package.json";

const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: "_MSG_extName",
  version: packageJson.version,
  description: "_MSG_extDesc",
  default_locale: "en",
  options_page: "src/pages/options/index.html",
  chrome_url_overrides: {
    newtab: "src/pages/newtab/index.html",
  },
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module",
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
  permissions: ["storage", "notifications"],
  optional_permissions: ["background"],
  host_permissions: ["http://*/*", "https://*/*"],
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
