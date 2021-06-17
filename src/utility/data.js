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
const FillObject = (currentRef, nextIdx) => {
  if (currentRef[nextIdx] === undefined) {
    const cr = currentRef;
    cr[nextIdx] = {};
  }
  return currentRef[nextIdx];
};

/** From the raw name and type output from cosmos, parse into a usable json.
 *  Formatted like the following:
 *  {
 *    'agent': {
 *      'type_of_name': 'vector<agentstruc>',
 *      0: {
 *        'type_of_name': 'agentstruc',
 *        'aprd': { 'type_of_name': 'double' },
 *        'beat': {
 *          'type_of_name': 'beatstruc',
 *          'addr': { 'type_of_name': 'char[]' },
 *          ...
 *        },
 *        ...
 *      },
 *      ...
 *    },
 *    ...
 *  }
 */
export const ParseNamesToJSON = (raw) => {
  const parsedJson = {};
  // Split by newline
  const lines = raw.split('\n');
  // Iterate over lines
  lines.forEach((line) => {
    // Split into name and type
    const [fullname, type] = line.split(/\s+/);
    // Remove ']', then split on '.' and '['
    const idxs = fullname.replaceAll(']', '').split(/\.|\[/);
    // For each indexes, create new objects in parsedJson
    let currentRef = parsedJson;
    idxs.forEach((idx) => {
      currentRef = FillObject(currentRef, idx);
    });
    currentRef.type_of_name = type;
  });

  return parsedJson;
};
