export default function compare(a, b) {
  if (a.utc > b.utc) {
    return -1;
  }
  if (a.utc < b.utc) {
    return 1;
  }
  return 0;
}
