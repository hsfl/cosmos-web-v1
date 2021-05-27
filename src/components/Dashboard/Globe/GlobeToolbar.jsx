import React, { useEffect, useRef, useState } from 'react';
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

  const { viewer } = useCesium();
  const [cameraHeight, setCameraHeight] = useState(100000);

  useEffect(() => {
    if (trackNode && trackNode !== '') {
      const pos = orbitsState.find((orbit) => orbit.name === trackNode).posGeod;
      pos.height = Math.max(pos.height+5000, cameraHeight);
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromRadians(pos.longitude, pos.latitude, pos.height),
        duration: 1,
      });
    }
  }, [trackNode, orbitsState, viewer, cameraHeight]);

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
