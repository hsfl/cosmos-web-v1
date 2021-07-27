export function compare(a, b) {
  if (a.utc > b.utc) {
    return -1;
  }
  if (a.utc < b.utc) {
    return 1;
  }
  return 0;
}

export const sortAlphabetically = (a, b) => {
  if (a.node > b.node) {
    return -1;
  }
  if (a.node < b.node) {
    return 1;
  }
  return 0;
};
