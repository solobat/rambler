const STORAGE_KEY = "rambler_cuid";

function initCuid() {
  const id = crypto.randomUUID();

  window.localStorage.setItem(STORAGE_KEY, id);

  return id;
}

function restoreCuid() {
  const id = window.localStorage.getItem(STORAGE_KEY);

  return id;
}

export function getCuid() {
  const id = restoreCuid();

  if (id) {
    return id;
  } else {
    return initCuid();
  }
}
