import dayjs from 'dayjs';

export const SET_KEY = 'SET_KEY';
export const SET_DATA = 'SET_DATA';
export const SET_ACTIVITY = 'SET_ACTIVITY';

/**
 * Add a key within the context
 *
 * @param {String} key Name to give the key in the context
 * @param {*} message Value to store in above key
 */
export function set(key, payload) {
  return {
    type: SET_KEY,
    key,
    payload,
  };
}

/**
 * Add a key in state.data field for realms
 *
 * @param {String} realm Realm key to store
 * @param {*} data Data associated with realm
 */
export function setData(realm, data) {
  return {
    type: SET_DATA,
    key: realm,
    payload: data,
  };
}

export function setActivity(activity) {
  return {
    type: SET_ACTIVITY,
    payload: {
      ...activity,
      time: dayjs(),
    },
  };
}
