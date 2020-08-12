import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { getDiff, MJDtoJavaScriptDate } from '../../utility/time';

/**
 * Counts down the downtime of the satellite
 */
function Downtime() {
  /** Get realm and node downtime */
  const realm = useSelector((s) => s.realm);
  /** The data coming in from the realm */
  const data = useSelector((s) => s.data);
  /** Last activity from database */
  const lastActivity = useSelector((s) => s.lastActivity);
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

  /** Initialize downtime counter */
  useEffect(() => {
    // If downtime exists within the last activity
    if (lastActivity && lastActivity.node_downtime) {
      setDowntime(dayjs(MJDtoJavaScriptDate(lastActivity.node_utc)).add(lastActivity.node_downtime, 'second'));
      setElapsed(getDiff(dayjs(MJDtoJavaScriptDate(lastActivity.node_utc)).add(lastActivity.node_downtime, 'second'), true));
    }
  }, [lastActivity]);

  /** Increments the timer */
  useEffect(() => {
    if (downtime != null && typeof elapsed !== 'string') {
      // Set the 1 second timer
      timer.current = setTimeout(() => {
        setElapsed(getDiff(downtime, true));
      }, 900);
    }
    // Clear timer on unmount
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
