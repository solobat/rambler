import Sync from './helper/sync';
import { create as createNotice } from './helper/notifications';
import { APP_ACTIONS } from './common/constant';
import { BackMsg, PageMsg } from './common/types';

// Listen to messages sent from other parts of the extension.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // onMessage must return "true" if response is async.
    let isResponseAsync = false;

    if (request.popupMounted) {
        console.log('eventPage notified that Popup.tsx has mounted.');
    }

    return isResponseAsync;
});

let sync = new Sync();

function msgHandler(req: PageMsg, sender, resp) {
    let { action, data, callbackId } = req;
    console.log("msgHandler -> req", req)
  
    function handler(results, isAsync = false) {
      const msg: BackMsg = {
        msg: `${action} response`,
        callbackId,
        data: results
      }
  
      if (!isAsync) {
        resp(msg)
      }
    }
  
    if (action === APP_ACTIONS.IMPORT_DATA) {
      init()
      handler('')
    } else if (action === APP_ACTIONS.START_SYNC) {
      sync.tryStartSync();
      handler('');
    } else if (action === APP_ACTIONS.STOP_SYNC) {
      sync.stopSync();
      handler('');
    }
  }
  
  ['onMessage', 'onMessageExternal'].forEach((msgType) => {
    chrome.runtime[msgType].addListener(msgHandler);
  });

  function initSync() {
    sync.on('received', () => {
      createNotice('Data Sync', 'The latest data has been synced from the cloud',
        chrome.extension.getURL('img/success.png'));
    })
  }

  function init() {
    initSync()
  }

  init()