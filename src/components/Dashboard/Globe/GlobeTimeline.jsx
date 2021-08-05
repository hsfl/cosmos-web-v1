import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCesium } from 'resium';
import PropTypes from 'prop-types';
import { set } from '../../../store/actions';
import { modifiedBinarySearch } from '../../../utility/data';

/* Manage Globe's timeline */
const GlobeTimeline = ({
  start, stop,
}) => {
  const { viewer } = useCesium();
  const simClock = useSelector((s) => s.simClock);
  const simData = useSelector((s) => s.simData);
  const simCurrentIdx = useSelector((s) => s.simCurrentIdx);
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
  /* useEffect(() => {
    dispatch(set('simClock', viewer.clock.currentTime));
    console.log(viewer.timeline.currentTime)
  }, [viewer]); */

  // When the simClock is updated, find closest soh values to the state time
  useEffect(() => {
    if (simData !== null) {
      // search through simData for closest timestamp
      const dataIdx = modifiedBinarySearch(simData.data[0], simClock, simData.nameIdx['c->node.loc.pos.eci.utc'], simCurrentIdx);
      dispatch(set('simCurrentIdx', dataIdx));
    }
  }, [simClock, simCurrentIdx, simData, dispatch]);

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
