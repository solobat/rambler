export function getRandomIndex(count: number) {
  if (count) {
    return Math.floor(Math.random() * count);
  } else {
    return -1;
  }
}
