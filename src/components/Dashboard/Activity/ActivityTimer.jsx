import React from 'react';
import PropTypes from 'prop-types';
/**
 * Shows the incoming activity from the web socket and displays time elapsed
 * from the last data retrieval.
 */
function ActivityTimer({
  elapsed,
}) {
  return (
    <>
      {
        elapsed && typeof elapsed !== 'string'
          ? elapsed.format('HH:mm:ss') : 'Over a day ago'
      }
    </>
  );
}

ActivityTimer.propTypes = {
  elapsed: PropTypes.oneOfType([PropTypes.string, PropTypes.shape]).isRequired,
};

export default ActivityTimer;
