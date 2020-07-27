import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { getDiff } from '../utility/time';

/**
 * Counts down the downtime of the satellite
 */
function Downtime() {
  /** Get realm and node downtime */
  const realm = useSelector((s) => s.realm);
  const nodeDowntime = useSelector((s) => {
    if (s.data[realm] && s.data[realm].node_downtime) {
      return s.data[realm].node_downtime;
    }

    return false;
  });

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
