import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { incrementQueue } from '../store/actions';
import { getDiff, MJDtoJavaScriptDate } from '../utility/time';

/**
 * Counts down the downtime of the satellite
 */
function Downtime() {
  const dispatch = useDispatch();

  /** Get realm and node downtime */
  const realm = useSelector((s) => s.realm);
  const nodeDowntime = useSelector((s) => {
    if (s.data[realm] && s.data[realm].node_downtime) {
      return s.data[realm].node_downtime;
    }

    return false;
  });
  const queriedData = useSelector((s) => s.queriedData);

  /** Timer to countdown time from node_downtime */
  const [downtime, setDowntime] = useState(null);
  /** Timer */
  const [elapsed, setElapsed] = useState('Finished');

  const timer = useRef(null);

  /** Upon node downtime change, recalculate countdown from now */
  useEffect(() => {
    if (nodeDowntime !== false) {
      setDowntime(dayjs().add(nodeDowntime, 'second'));
      setElapsed(getDiff(dayjs().add(nodeDowntime, 'second'), true));
    }
  }, [nodeDowntime]);

  /** Increments the timer */
  useEffect(() => {
    if (downtime != null && typeof elapsed !== 'string') {
      /** Set the 1 second timer */
      timer.current = setTimeout(() => {
        setElapsed(getDiff(downtime, true));
      }, 900);
    }
    /** Clear timer on unmount */
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed]);

  /** Upon querying data, calculate the last known node downtime and countdown */
  useEffect(() => {
    if (queriedData) {
      const lastNodeDowntime = queriedData.node_downtime[queriedData.node_downtime.length - 1];
      const lastNodeUTC = queriedData.node_utc[queriedData.node_utc.length - 1];

      //
      setDowntime(dayjs(MJDtoJavaScriptDate(lastNodeUTC).toISOString()).add(lastNodeDowntime, 'second'));
      setElapsed(getDiff(dayjs(MJDtoJavaScriptDate(lastNodeUTC).toISOString()).add(lastNodeDowntime, 'second'), true));

      dispatch(incrementQueue());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queriedData]);

  return (
    <>
      {
        elapsed && typeof elapsed !== 'string'
          ? elapsed.format('HH:mm:ss') : dayjs().second(0).minute(0).hour(0)
            .format('HH:mm:ss')
      }
    </>
  );
}

export default Downtime;
