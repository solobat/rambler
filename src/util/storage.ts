import { SESSION_STORAGE } from "@src/common/constant";

export function getBookFilter() {
  const key = `${SESSION_STORAGE.BOOK_FILTER}`;

  return window.sessionStorage.getItem(key) === "1";
}

export function setBookFilter(filter: boolean) {
  const key = `${SESSION_STORAGE.BOOK_FILTER}`;

  window.sessionStorage.setItem(key, filter ? "1" : "0");
}
