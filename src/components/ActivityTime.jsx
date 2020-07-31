import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { incrementQueue } from '../store/actions';
import { getDiff, MJDtoJavaScriptDate } from '../utility/time';

/**
 * Shows the incoming activity from the web socket and displays time elapsed
 * from the last data retrieval.
 */
function ActivityTimer() {
  const dispatch = useDispatch();

  /** Get agent list state from the Context */
  const activities = useSelector((s) => s.activity);
  const queriedData = useSelector((s) => s.queriedData);

  const [lastMessage, setLastMessage] = useState(null);
  /** Time elapsed from last activity */
  const [elapsed, setElapsed] = useState('Over a day');
  /** Reference to the timer that increments all elapsed times after 1 second */
  const timer = useRef(null);

  const lastMessageTimeRef = useRef(null);
  lastMessageTimeRef.current = lastMessage;

  /** Retrieve last activity time */
  useEffect(() => {
    if (activities && activities.length > 0) {
      setLastMessage(getDiff(activities[0].time));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities]);

  /** Upon querying historical data, calculate the last known node activity */
  useEffect(() => {
    if (queriedData) {
      if (queriedData.node_utc && queriedData.node_utc.length > 0) {
        const lastNodeUTC = queriedData.node_utc[queriedData.node_utc.length - 1];

        setLastMessage(dayjs(MJDtoJavaScriptDate(lastNodeUTC).toISOString()));
      }

      dispatch(incrementQueue());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queriedData]);

  /** Increments the timer */
  useEffect(() => {
    /** Set the 1 second timer */
    timer.current = setTimeout(() => {
      if (queriedData != null || lastMessage != null) {
        setElapsed(getDiff(lastMessageTimeRef.current));
      }
    }, 900);

    /** Clear timer on unmount */
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, lastMessage]);

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
