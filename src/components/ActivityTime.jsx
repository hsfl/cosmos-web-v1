import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

/**
 * Shows the incoming activity from the web socket and displays time elapsed
 * from the last data retrieval.
 */
function ActivityTimer() {
  /** Get agent list state from the Context */
  const activities = useSelector((s) => s.activity);
  /** Time elapsed from last activity */
  const [elapsed, setElapsed] = useState('Over a day ago');
  /** Reference to the timer that increments all elapsed times after 1 second */
  const timer = useRef(null);

  /**
   * Calculate the difference between the current time and the date provided, returning
   * the difference as a dayjs object. If the difference is over a day, then a string is returned.
   * @param {dayjs object} date
   */
  const getDiff = (date) => {
    if (typeof date !== 'string' && dayjs().diff(date, 'day') < 1) {
      const hour = dayjs().diff(date, 'hour');
      const minute = dayjs().diff(date, 'minute') % 60;
      const second = dayjs().diff(date, 'second') % 60;
      return dayjs().set('hour', hour).set('minute', minute).set('second', second);
    }

    return 'Over a day ago';
  };

  useEffect(() => {
    if (activities && activities.length > 0) {
      setElapsed(getDiff(activities[0].time));
    }
  }, [activities]);

  /** Increments the timer */
  useEffect(() => {
    /** Set the 1 second timer */
    timer.current = setTimeout(() => {
      setElapsed(getDiff(activities[0].time));
    }, 900);

    /** Clear timer on unmount */
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed]);
  return (
    <>
      {
        elapsed && typeof elapsed !== 'string'
          ? elapsed.format('HH:mm:ss') : 'Over a day ago'
      }
    </>
  );
}

export default ActivityTimer;
