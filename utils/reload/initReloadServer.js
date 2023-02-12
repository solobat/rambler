import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import { clearTimeout } from 'timers';

function debounce(callback, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => callback(...args), delay);
    };
}

const LOCAL_RELOAD_SOCKET_PORT = 8081;
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

const clientsThatNeedToUpdate = new Set();
function initReloadServer() {
    const wss = new WebSocketServer({ port: LOCAL_RELOAD_SOCKET_PORT });
    wss.on("connection", (ws) => {
        clientsThatNeedToUpdate.add(ws);
        ws.addEventListener("close", () => clientsThatNeedToUpdate.delete(ws));
        ws.addEventListener("message", (event) => {
            const message = Interpreter.Receive(String(event.data));
            if (message.type === UPDATE_COMPLETE_MESSAGE) {
                ws.close();
            }
        });
    });
}
/** CHECK:: src file was updated **/
chokidar.watch("src").on("all", (event, path) => {
    debounce(sendPendingUpdateMessageToAllSockets, 200)(path);
});
function sendPendingUpdateMessageToAllSockets(path) {
    const _sendPendingUpdateMessage = (ws) => sendPendingUpdateMessage(ws, path);
    clientsThatNeedToUpdate.forEach(_sendPendingUpdateMessage);
}
function sendPendingUpdateMessage(ws, path) {
    ws.send(Interpreter.Send({ type: UPDATE_PENDING_MESSAGE, path }));
}
/** CHECK:: build was completed **/
chokidar.watch("dist").on("all", () => {
    debounce(sendUpdateMessageToAllSockets, 200)();
});
function sendUpdateMessageToAllSockets() {
    clientsThatNeedToUpdate.forEach(sendUpdateMessage);
}
function sendUpdateMessage(ws) {
    ws.send(Interpreter.Send({ type: UPDATE_REQUEST_MESSAGE }));
}
initReloadServer();
