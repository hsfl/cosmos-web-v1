import React from 'react';
import PropTypes from 'prop-types';
/**
 * Shows the incoming activity from the web socket and displays time elapsed
 * from the last data retrieval.
 */
function ActivityTimer({
  data,
}) {
  return (
    <>
      {
        data && data.length !== 0 && typeof data[0].elapsed !== 'string'
          ? data[0].elapsed.format('HH:mm:ss') : 'Over a day ago'
      }
    </>
  );
}

ActivityTimer.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape).isRequired,
};

export default ActivityTimer;
