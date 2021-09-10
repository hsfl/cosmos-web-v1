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

/**
 * Check if a given value is zero or only zeros.
 * Used when a component should not showZero.
 * Input: some value to check
 * Output: true if value contains only zeros, otherwise false
 */
export const isOnlyZeros = (value) => {
  const s = JSON.stringify(value);
  const parsed = JSON.parse(s, (k, v) => {
    // Check if json object is an array
    if (Array.isArray(v)) {
      // Return true if array contains nonempty elements
      if (v.some(() => true)) {
        return true;
      }
    // Check if json object is an object
    } else if (v.constructor === Object) {
      // Return true if object contains nonempty values
      if (Object.keys(v).length > 0) {
        return true;
      }
    // Return true if atomic json value is nonzero
    } else if (v !== 0) {
      return true;
    }
    return undefined;
  });
  return !!parsed;
};
