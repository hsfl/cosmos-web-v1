import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useCesium } from 'resium';
import PropTypes from 'prop-types';
import { set } from '../../../store/actions';

/* Manage Globe's timeline */
const GlobeTimeline = ({
  start, stop,
}) => {
  const { viewer } = useCesium();
  const dispatch = useDispatch();

  // Update timeline range
  useEffect(() => {
    if (viewer && stop) {
      viewer.timeline.zoomTo(start, stop);
      viewer.clock.currentTime = start;
      viewer.timeline.currentTime = start;
    }
  }, [start, stop, viewer]);

  // Update state clock
  useEffect(() => {
    // dispatch(set('simClock', viewer.clock.currentTime));
    // console.log(viewer.timeline.currentTime)
  }, [viewer]);

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
