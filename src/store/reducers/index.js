import { SET_KEY, SET_DATA, SET_ACTIVITY } from '../actions';

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
  debug: true,
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
    default:
      return state;
  }
}
