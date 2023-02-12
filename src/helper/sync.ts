import { throttle } from "lodash";
import {
  STORAGE_KEYS,
  SYNC_STATUS,
  WEBDAV_MAX_SYNC_INTERVAL,
  WEBDAV_MIN_SYNC_INTERVAL,
} from "../common/constant";
import { SimpleEvent } from "../util/event";
import { tuple } from "../util/types";
import { onDbUpdate } from "./db.helper";
import { createDataSyncTick, isWebDavConfiged } from "./webdav";

const EventTypes = tuple("received", "uploaded");

export type EventType = typeof EventTypes[number];

export function isAutoSync() {
  return chrome.storage.local.get(STORAGE_KEYS.AUTO_SYNC).then((res) => {
    return res[STORAGE_KEYS.AUTO_SYNC] === 1;
  });
}

export default class Sync extends SimpleEvent<EventType> {
  syncStatus;
  syncTimer = 0;
  syncInterval = WEBDAV_MAX_SYNC_INTERVAL;

  constructor(options?: { syncInterval?: number }) {
    super();
    this.syncInterval = options?.syncInterval ?? WEBDAV_MAX_SYNC_INTERVAL;
    this.tryStartSync();
    this.setupAutoSync();
  }

  setupAutoSync() {
    onDbUpdate(() => {
      isAutoSync().then((bool) => {
        if (bool) {
          this.tryStartSync();
        }
      });
    });
  }

  stopSync() {
    clearInterval(this.syncTimer);
    this.syncStatus = SYNC_STATUS.WAIT;
  }

  async runDataSyncTick() {
    try {
      const newReceived = await createDataSyncTick();

      if (newReceived) {
        this.emit("received");
      }
      this.syncStatus = SYNC_STATUS.SUCCESS;
    } catch (error) {
      console.log(error);
      this.syncStatus = SYNC_STATUS.FAIL;
    }
  }

  private getSyncInterval() {
    const interval = this.syncInterval || WEBDAV_MAX_SYNC_INTERVAL;

    return interval;
  }

  startSync = throttle(async function (this: Sync) {
    this.stopSync();
    this.syncStatus = SYNC_STATUS.BEGIN;
    await this.runDataSyncTick();

    const inerval = this.getSyncInterval();

    this.syncTimer = setInterval(async () => {
      await this.runDataSyncTick();
    }, inerval) as any;
  }, WEBDAV_MIN_SYNC_INTERVAL);

  tryStartSync() {
    if (isWebDavConfiged()) {
      this.startSync();
    }
  }
}
