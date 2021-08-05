export const parseDataKey = (dataKey, data) => {
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
  const dataKeyPaths = dataKey.slice(firstKey.length + 1).replaceAll(']', '').split(/\.|\[/);
  if (dataKeyPaths.length === 1 && dataKeyPaths[0] === '') {
    return data[firstKey];
  }
  return dataKeyPaths.reduce(
    (obj, key) => (
      (obj && obj[key] !== 'undefined') ? obj[key] : undefined
    ),
    data[firstKey],
  );
};

/** Compute result of a function fx that can use multiple variables */
export const MultiVarFx = (
  // Array of dataKeys to access data
  vars,
  // Function using values of data
  fx,
  // Object containing data
  data,
) => {
  if (Array.isArray(vars)) {
    return fx(vars.map((v) => data[v]));
  }

  return fx(data[vars]);
};

/** Returns the object at the index of the base object,
 *   and creates a new object at the index if it does not exist
 */
const getObjectAtIdx = (currentRef, nextIdx, createObjIfUndefined = true) => {
  if (currentRef[nextIdx] === undefined && createObjIfUndefined) {
    const cr = currentRef;
    cr[nextIdx] = {};
  }
  return currentRef[nextIdx];
};

/** Given an array of indexes, index the arr recursively and return the deepest object */
export const getObjAtName = (name, arr) => {
  let currentRef = arr;
  // Remove ']', then split on '.' and '['
  const idxs = name.replaceAll(']', '').split(/\.|\[/);
  // Recursively index array, break early if undefined
  idxs.some((idx) => {
    currentRef = getObjectAtIdx(currentRef, idx, false);
    return !currentRef;
  });
  return currentRef;
};

// It's essentially a normal binary search algorithm,
// but it checks the next item in the list first before doing the whole thing
// arr should be provided a simData. Could be made more generic
// Also note that it's currently just taking in the first in the simData.data array,
// it could be the shortest, longest, you may not cover every element in some arrays.
export const modifiedBinarySearch = (arr, x, colIdx, lastidx = undefined) => {
  let start = 0;
  let end = arr.length - 1;

  // Success condition
  // Either it is exactly equal, or fits inbetween the current idx and the one above
  const checkMatch = (idx) => {
    if (idx > end) return false;
    const oneAbove = idx + 1 > end ? end : idx + 1;
    if (x >= arr[idx][colIdx] && x < arr[oneAbove][colIdx] || x === arr[idx][colIdx]) {
      return true;
    }
      return false;
  };

  // First check around lastidx
  if (lastidx !== null && lastidx !== undefined) {
    if (checkMatch(lastidx)) return lastidx;
    if (checkMatch(lastidx + 1)) return lastidx + 1;
  }
  let mid;
  // Otherwise, a typical binary search implementation
  while (start <= end) {
    mid = Math.floor((start + end) / 2);

    if (checkMatch(mid)) {
      return mid;
    }
    if (arr[mid][colIdx] < x) {
      start = mid + 1;
    } else {
      end = mid - 1;
    }
  }

  // No match found (ie: not within time bounds), return closest match
  return mid;
};
