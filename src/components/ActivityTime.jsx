import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { message } from 'antd';
import { axios } from '../api';
import { incrementQueue } from '../store/actions';
import { getDiff, MJDtoJavaScriptDate } from '../utility/time';

/**
 * Shows the incoming activity from the web socket and displays time elapsed
 * from the last data retrieval.
 */
function ActivityTimer({
  realm,
}) {
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

  const queryData = async () => {
    try {
      const { data } = await axios.post(`query/${realm}/any/`, {
        query: {},
        // options: {
        //   projection: {
        //     node_utc: 1,
        //   },
        // },
        // sort: {
        //   node_utc: 1,
        // },
      });
      console.log(data, realm);
    } catch {
      message.error('Failed to retrieve last activity.');
    }
  };

  useEffect(() => {
    setTimeout(() => queryData(), 5000);
  }, []);

  /** Retrieve last activity time */
  useEffect(() => {
    if (activities && activities.length > 0) {
      clearTimeout(timer.current);
      setElapsed(getDiff(activities[0].time));
      setLastMessage(activities[0].time);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities]);

  /** Upon querying historical data, calculate the last known node activity */
  useEffect(() => {
    if (queriedData) {
      if (queriedData.node_utc && queriedData.node_utc.length > 0) {
        const lastNodeUTC = queriedData.node_utc[queriedData.node_utc.length - 1];
        clearTimeout(timer.current);
        setElapsed(getDiff(dayjs(MJDtoJavaScriptDate(lastNodeUTC).toISOString())));
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

ActivityTimer.propTypes = {
  realm: PropTypes.string.isRequired,
};

export default ActivityTimer;
