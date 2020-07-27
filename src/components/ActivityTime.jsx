import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { getDiff } from '../utility/time';

/**
 * Shows the incoming activity from the web socket and displays time elapsed
 * from the last data retrieval.
 */
function ActivityTimer() {
  /** Get agent list state from the Context */
  const activities = useSelector((s) => s.activity);
  /** Time elapsed from last activity */
  const [elapsed, setElapsed] = useState('Over a day');
  /** Reference to the timer that increments all elapsed times after 1 second */
  const timer = useRef(null);

  useEffect(() => {
    if (activities && activities.length > 0) {
      setElapsed(getDiff(activities[0].time));
    }
  }, [activities]);

  /** Increments the timer */
  useEffect(() => {
    /** Set the 1 second timer */
    timer.current = setTimeout(() => {
      if (activities && activities.length > 0) {
        setElapsed(getDiff(activities[0].time));
      }
    }, 900);

    /** Clear timer on unmount */
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed]);

  return (
    <>
      {
        elapsed && typeof elapsed !== 'string'
          ? elapsed.format('HH:mm:ss') : 'Over a day'
      }
    </>
  );
}

export default ActivityTimer;
