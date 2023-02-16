const STORAGE_KEY = "rambler_cuid";

function initCuid() {
  const id = crypto.randomUUID();

  chrome.storage.local.set({
    [STORAGE_KEY]: id,
  });

  return id;
}

async function restoreCuid() {
  const res = await chrome.storage.local.get(STORAGE_KEY);

  return res[STORAGE_KEY];
}

export async function getCuid() {
  const id = await restoreCuid();

  if (id) {
    return id;
  } else {
    return initCuid();
  }
}
