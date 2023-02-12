const LOCAL_RELOAD_SOCKET_PORT = 8081;
const LOCAL_RELOAD_SOCKET_URL = `ws://localhost:${LOCAL_RELOAD_SOCKET_PORT}`;
const UPDATE_PENDING_MESSAGE = "wait_update";
const UPDATE_REQUEST_MESSAGE = "do_update";
const UPDATE_COMPLETE_MESSAGE = "done_update";

const Interpreter = {
    Send: send,
    Receive: receive,
};
function send(message) {
    return JSON.stringify(message);
}
function receive(message) {
    return JSON.parse(message);
}

let needToUpdate = false;
function initReloadClient({ watchPath, onUpdate, }) {
    const socket = new WebSocket(LOCAL_RELOAD_SOCKET_URL);
    function sendUpdateCompleteMessage() {
        socket.send(Interpreter.Send({ type: UPDATE_COMPLETE_MESSAGE }));
    }
    socket.addEventListener("message", (event) => {
        const message = Interpreter.Receive(String(event.data));
        switch (message.type) {
            case UPDATE_REQUEST_MESSAGE: {
                if (needToUpdate) {
                    sendUpdateCompleteMessage();
                    needToUpdate = false;
                    onUpdate();
                }
                return;
            }
            case UPDATE_PENDING_MESSAGE: {
                needToUpdate = checkUpdateIsNeeded({
                    watchPath,
                    updatedPath: message.path,
                });
                return;
            }
        }
    });
    return socket;
}
function checkUpdateIsNeeded({ watchPath, updatedPath, }) {
    return updatedPath.includes(watchPath);
}

function addHmrIntoScript(watchPath) {
    initReloadClient({
        watchPath,
        onUpdate: () => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            chrome.runtime.reload();
        },
    });
}

export { addHmrIntoScript as default };
