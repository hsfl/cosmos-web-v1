import dayjs from 'dayjs';

/**
 * Convert MJD to human readable UTC date
 *
 * @param {Number} mjd MJD to convert
 * @returns {String} UTC date string
 */
export function mjdToString(mjd) {
  return dayjs
    .unix((((mjd + 2400000.5) - 2440587.5) * 86400.0))
    .utc()
    .format('YYYY-MM-DDTHH:mm:ss');
}

/**
 * Convert a dayjs date to MJD
 *
 * @param {dayjs} date dayjs object
 * @returns {Number} MJD date
 */
export function dateToMJD(date) {
  return (date.unix() / 86400.0) + 2440587.5 - 2400000.5;
}

/**
 * Convert MJD to a JavaScript date
 *
 * @param {Number} mjd Number to conver tto JavaScript date
 * @returns {Date} JavaScript date object
 */
export function MJDtoJavaScriptDate(mjd) {
  return dayjs
    .unix((((mjd + 2400000.5) - 2440587.5) * 86400.0))
    .toDate();
}

/**
 * Calculate the difference between the current time and the date provided, returning
 * the difference as a dayjs object. If the difference is over a day, then a string is returned.
 *
 * @param {dayjs object} date
 */
export function getDiff(date) {
  if (typeof date !== 'string' && dayjs().diff(date, 'day') < 1) {
    const hour = dayjs().diff(date, 'hour');
    const minute = dayjs().diff(date, 'minute') % 60;
    const second = dayjs().diff(date, 'second') % 60;
    return dayjs().set('hour', hour).set('minute', minute).set('second', second);
  }

  return 'Over a day';
}
