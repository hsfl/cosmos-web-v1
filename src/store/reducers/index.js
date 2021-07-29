import {
  SET_KEY, SET_DATA, SET_KEY_ERROR, SET_ACTIVITY, INCREMENT_QUEUE, RESET_QUEUE,
} from '../actions';

/**
 * Process the value provided by get() function and place in context
 */
export default function reducer(state = {
  namespace: {},
  file_list: {},
  list: {},
  xAxis: [null, null],
  data: {},
  realm: null,
  activity: [],
  keys: {},
  retrievedQuery: null,
  simData: null,
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
    case SET_KEY_ERROR:
      return {
        ...state,
        keys: {
          ...state.keys,
          [key]: {
            ...state.keys[key],
            ...payload,
          },
        },
      };
    case SET_ACTIVITY:
      return {
        ...state,
        activity: [
          // limit activity to latest 20
          payload,
          ...state.activity.slice(0, 19),
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
    default:
      return state;
  }
}
