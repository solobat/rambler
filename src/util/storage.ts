import { SESSION_STORAGE } from "@src/common/constant";

export function getBookFilter() {
  const key = `${SESSION_STORAGE.BOOK_FILTER}`;
  const val =  window.sessionStorage.getItem(key);

  if (val) {
    return val === "1"
  } else {
    return true
  }
}

export function setBookFilter(filter: boolean) {
  const key = `${SESSION_STORAGE.BOOK_FILTER}`;

  window.sessionStorage.setItem(key, filter ? "1" : "0");
}
