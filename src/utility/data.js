export default function parseDataKey(dataKey, data) {
  let firstKey = '';
  const dataKeySplit = dataKey.split('.');
  dataKeySplit.some((elem) => {
    firstKey += elem;
    // Check if soh has the key str
    if (Object.prototype.hasOwnProperty.call(data, firstKey)) {
      return true;
    }
    // Otherwise, continue iteration
    firstKey += '.';
    return false;
  });

  // return undefined if no match was found
  if (firstKey.length > dataKey.length) {
    return undefined;
  }

  // Remove firstKey from the dataKey, then remove ']' and split on '.' and '['
  const dataKeyPaths = dataKey.slice(firstKey.length + 1).replace(']', '').split(/\.|\[/);
  return dataKeyPaths.reduce(
    (obj, key) => (
      (obj && obj[key] !== 'undefined') ? obj[key] : undefined
    ),
    data[firstKey],
  );
}
