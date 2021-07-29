import React, { useEffect, useRef, useState } from 'react';
import { useCesium } from 'resium';
import PropTypes from 'prop-types';

/* Manage Globe's timeline */
const GlobeTimeline = ({
  start, stop,
}) => {
  const { viewer } = useCesium();

  useEffect(() => {
    if (viewer && stop) {
      viewer.timeline.zoomTo(start, stop);
      viewer.clock.currentTime = start;
      viewer.timeline.currentTime = start;
    }
  }, [start, stop, viewer]);

  // May eventually return some visible thing, but null for now
  return (
    null
  );
};

GlobeTimeline.propTypes = {
  start: PropTypes.any.isRequired,
  stop: PropTypes.any.isRequired,
};

export default GlobeTimeline;
