import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

/**
 * Shows the incoming activity from the web socket and displays time elapsed
 * from the last data retrieval.
 */
function ShowTime({
  utc,
  format,
}) {
  const [time, setTime] = useState(utc ? dayjs().utc() : dayjs());

  /** On mount, set the time and update each second */
  useEffect(() => {
    // Every second, update local and UTC time view
    const clock = setTimeout(() => {
      setTime(utc ? dayjs().utc() : dayjs());
    }, 900);

    // Stop timeout on unmount
    return () => {
      clearTimeout(clock);
    };
  }, [time]);

  return (
    <>
      {
        utc ? time.utc().format(format) : time.format(format)
      }
    </>
  );
}

ShowTime.propTypes = {
  utc: PropTypes.bool.isRequired,
  format: PropTypes.string.isRequired,
};

export default ShowTime;
