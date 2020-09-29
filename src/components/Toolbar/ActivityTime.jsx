import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { getDiff, MJDtoJavaScriptDate } from '../../utility/time';

/**
 * Shows the incoming activity from the web socket and displays time elapsed
 * from the last data retrieval.
 */
function ActivityTimer() {
  /** Get agent list state from the Context */
  const activities = useSelector((s) => s.activity);
  /** Last activity from database */
  const lastActivity = useSelector((s) => s.lastActivity);
  /** List of queried data */
  const queriedData = useSelector((s) => s.queriedData);
  /** The time of the last message */
  const [lastMessage, setLastMessage] = useState(null);
  /** Time elapsed from last activity */
  const [elapsed, setElapsed] = useState('Over a day');
  /** Reference to the timer that increments all elapsed times after 1 second */
  const timer = useRef(null);

  /** Reference to the lastMessage */
  const lastMessageTimeRef = useRef(null);
  lastMessageTimeRef.current = lastMessage;

  /** Retrieve last activity time */
  useEffect(() => {
    if (activities && activities.length > 0) {
      // Reset timer and set the new timer
      clearTimeout(timer.current);
      setElapsed(getDiff(activities[0].time));
      setLastMessage(activities[0].time);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities]);

  /** Initialize activity timer */
  useEffect(() => {
    // If there is a last activity
    if (lastActivity && lastActivity.node_utc) {
      // Set last message and elapsed
      setLastMessage(dayjs(MJDtoJavaScriptDate(lastActivity.node_utc).toISOString()));
      setElapsed(getDiff(dayjs(MJDtoJavaScriptDate(lastActivity.node_utc).toISOString())));
    }
  }, [lastActivity]);

  /** Increments the timer */
  useEffect(() => {
    // Set the 1 second timer
    timer.current = setTimeout(() => {
      if (queriedData != null || lastMessage != null) {
        setElapsed(getDiff(lastMessageTimeRef.current));
      }
    }, 900);

    // Clear timer on unmount
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
