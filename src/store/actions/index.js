import dayjs from 'dayjs';

export const SET_KEY = 'SET_KEY';
export const SET_DATA = 'SET_DATA';
export const SET_KEY_ERROR = 'SET_KEY_ERROR';
export const SET_ACTIVITY = 'SET_ACTIVITY';
export const INCREMENT_QUEUE = 'INCREMENT_QUEUE';
export const RESET_QUEUE = 'RESET_QUEUE';

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

export function setKeyError(tab, data) {
  return {
    type: SET_KEY_ERROR,
    key: tab,
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

export function incrementQueue() {
  return {
    type: INCREMENT_QUEUE,
  };
}

export function resetQueue() {
  return {
    type: RESET_QUEUE,
  };
}
