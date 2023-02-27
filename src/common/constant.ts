
export const STORAGE_LOCAL = {
    CURRENT_BOOK_ID: 'current_book_id' 
}

export const SESSION_STORAGE = {
    CURRENT_BOOK_ID: 'current_book_id' 
}

export const SOLID_COLORS = [
    '#1e1e1e',
    '#202124',
    '#373c38',
    '#5b7e91',
    '#606da1',
    '#727171',
    '#3c3c3c',
];

export const APP_ACTIONS = {
    IMPORT_DATA: 'importData',
    MSG_RESP: 'msgResp',
    START_SYNC: 'startSync',
    STOP_SYNC: 'stopSync'
}

export const STORAGE_KEYS = {
    SYNC_INTERVAL: 'sync_interval',
    AUTO_SYNC: 'auto_sync',
    ALLOW_COMMENT: 'allow_comment'
}

export const SYNC_INTERVAL_OPTIONS = [
    { label: '10s', value: 10 * 1000 },
    { label: '30s', value: 30 * 1000 },
    { label: '1min', value: 60 * 1000 },
    { label: '5mins', value: 5 * 60 * 1000 },
    { label: '30mins', value: 30 * 60 * 1000 },
]

export const SYNC_STATUS = {
    WAIT: 'wait',
    BEGIN: 'begin',
    SUCCESS: 'success',
    FAIL: 'fail'
}

export const WEBDAV_MIN_SYNC_INTERVAL = SYNC_INTERVAL_OPTIONS[0].value;

export const WEBDAV_MAX_SYNC_INTERVAL = SYNC_INTERVAL_OPTIONS[4].value;