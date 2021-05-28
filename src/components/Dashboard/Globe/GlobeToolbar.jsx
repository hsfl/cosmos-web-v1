import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Cesium from 'cesium';
import { useCesium } from 'resium';

import DropdownMenu from './DropDownMenu';

const GlobeToolbar = ({
  orbitsState,
}) => {
  const list = useSelector((s) => s.list.agent_list);

  const [trackNode, setTrackNode] = useState('');

  const { viewer, entityCollection } = useCesium();
  const [cameraHeight, setCameraHeight] = useState(100000);

  useEffect(() => {
    if (trackNode && trackNode !== '') {
	  const nodePos = entityCollection.getById(trackNode + "_model").position.getValue();
	  viewer.camera.lookAt(
	    nodePos,
		new Cesium.HeadingPitchRange(
		  viewer.camera.heading, viewer.camera.pitch, 1000
		)
	  );
    }
  }, [trackNode, viewer, orbitsState, cameraHeight]);

  /** Track selected node with camera */
  const handleNodeDropDownClick = (nodeName) => {
    if (trackNode === nodeName) {
      setTrackNode('');
    } else {
      setCameraHeight(viewer.camera.positionCartographic.height);
      setTrackNode(nodeName);
    }
  };

  return (
    <div className="globetoolbar-container">
      <DropdownMenu list={list !== undefined ? list : []} dataKey="node" callBack={handleNodeDropDownClick} />
    </div>
  );
};

GlobeToolbar.propTypes = {
  orbitsState: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default GlobeToolbar;
