import {
  SET_KEY, SET_DATA, SET_ACTIVITY, INCREMENT_QUEUE, RESET_QUEUE, SET_LIVE_DATA,
} from '../actions';

/**
 * Process the value provided by get() function and place in context
 */
export default function reducer(state = {
  namespace: {},
  file_list: {},
  list: {},
  data: {},
  realm: null,
  activity: [],
  keys: {},
  retrievedQuery: null,
  allKeys: {},
  tab: 'defaultLayout',
}, {
  type, key, payload,
}) {
  switch (type) {
    case SET_KEY:
      return {
        ...state,
        [key]: payload,
      };
    case SET_DATA:
      return {
        ...state,
        data: {
          ...state.data,
          [key]: {
            ...state.data[key],
            ...payload,
          },
        },
      };
    case SET_ACTIVITY:
      return {
        ...state,
        activity: [
          payload,
          ...state.activity,
        ],
      };
    case INCREMENT_QUEUE:
      return {
        ...state,
        retrievedQuery: state.retrievedQuery + 1,
      };
    case RESET_QUEUE:
      return {
        ...state,
        retrievedQuery: 0,
      };
    case SET_LIVE_DATA:
      return {
        ...state,
        keys: {
          ...state.keys,
          [key]: { // tab to store in
            ...state.keys[key],
            realtimeKeys: {
              ...state.keys[key].realtimeKeys,
              [payload.key]: [
                ...state.keys[key].realtimeKeys[payload.key],
                payload.value,
              ],
            },
          },
        },
      };
    default:
      return state;
  }
}
