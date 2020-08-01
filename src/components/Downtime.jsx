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
  /** The data coming in from the realm */
  const data = useSelector((s) => s.data);
  /** The list of data retrieved from database */
  const queriedData = useSelector((s) => s.queriedData);

  /** Timer to countdown time from node_downtime */
  const [downtime, setDowntime] = useState(null);
  /** Timer */
  const [elapsed, setElapsed] = useState('Finished');

  const timer = useRef(null);

  /** Upon node downtime change, recalculate countdown from now */
  useEffect(() => {
    if (data && data[realm]) {
      if (timer !== null) {
        clearTimeout(timer.current);
      }
      setDowntime(dayjs().add(data[realm].node_downtime, 'second'));
      setElapsed(getDiff(dayjs().add(data[realm].node_downtime, 'second'), true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  /** Upon querying data, calculate the last known node downtime and count down */
  useEffect(() => {
    if (queriedData) {
      if (queriedData.node_utc && queriedData.node_utc.length > 0
          && queriedData.node_downtime && queriedData.node_downtime.length > 0
      ) {
        if (timer !== null) {
          clearTimeout(timer.current);
        }
        const lastNodeDowntime = queriedData.node_downtime[queriedData.node_downtime.length - 1];
        const lastNodeUTC = queriedData.node_utc[queriedData.node_utc.length - 1];

        // Set the past downtime
        setDowntime(dayjs(MJDtoJavaScriptDate(lastNodeUTC)).add(lastNodeDowntime, 'second'));
        setElapsed(getDiff(dayjs(MJDtoJavaScriptDate(lastNodeUTC)).add(lastNodeDowntime, 'second'), true));
      }

      dispatch(incrementQueue());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queriedData]);

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
  }, [elapsed, downtime]);

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
