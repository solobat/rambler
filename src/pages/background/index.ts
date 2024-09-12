import reloadOnUpdate from "virtual:reload-on-update-in-background-script";
import { create as createNotice } from "../../helper/notifications";
import { APP_ACTIONS } from "../../common/constant";
import { BackMsg, PageMsg } from "../../common/types";

reloadOnUpdate("pages/background");

// Listen to messages sent from other parts of the extension.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // onMessage must return "true" if response is async.
  let isResponseAsync = false;

  if (request.popupMounted) {
    console.log("eventPage notified that Popup.tsx has mounted.");
  }

  return isResponseAsync;
});

function msgHandler(req: PageMsg, sender, resp) {
  let { action, data, callbackId } = req;
  console.log("msgHandler -> req", req);

  function handler(results, isAsync = false) {
    const msg: BackMsg = {
      msg: `${action} response`,
      callbackId,
      data: results,
    };

    if (!isAsync) {
      resp(msg);
    }
  }

  if (action === APP_ACTIONS.IMPORT_DATA) {
    handler("");
  }
}

["onMessage", "onMessageExternal"].forEach((msgType) => {
  chrome.runtime[msgType].addListener(msgHandler);
});
