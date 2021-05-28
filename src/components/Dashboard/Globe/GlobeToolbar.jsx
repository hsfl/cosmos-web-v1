import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Cesium from 'cesium';
import { useCesium } from 'resium';

import { COSMOSAPI } from '../../../api';

import DropdownMenu from './DropDownMenu';

const GlobeToolbar = ({
  orbitsState,
}) => {
  const list = useSelector((s) => s.list.agent_list);

  const [trackNode, setTrackNode] = useState('');

  const { viewer, entityCollection } = useCesium();
  const [cameraHeight, setCameraHeight] = useState(100000);

  // List of formations, hardcoded for now
  const formationsList = [{ formation: 'Line' }, { formation: 'Diamond' }];

  useEffect(() => {
    if (trackNode && trackNode !== '') {
      const nodePos = entityCollection.getById(`${trackNode}_model`).position.getValue();
      viewer.camera.lookAt(
        nodePos,
        new Cesium.HeadingPitchRange(
          viewer.camera.heading, viewer.camera.pitch, 1000,
        ),
      );
    }
  }, [trackNode, viewer, orbitsState, cameraHeight, entityCollection]);

  /** Track selected node with camera */
  const handleNodeDropDownClick = (nodeName) => {
    if (trackNode === nodeName) {
      setTrackNode('');
    } else {
      setCameraHeight(viewer.camera.positionCartographic.height);
      setTrackNode(nodeName);
    }
  };

  /** Send request to switch flying formations */
  const handleFormationDropDownClick = (formation) => {
    if (formation === 'Line') {
      COSMOSAPI.runAgentCommand('sim', 'simulator', 'set_shape_type 0', () => {});
    } else if (formation === 'Diamond') {
      COSMOSAPI.runAgentCommand('sim', 'simulator', 'set_shape_type 1', () => {});
    }
  };

  return (
    <div className="globetoolbar-container">
      <DropdownMenu list={list !== undefined ? list : []} dataKey="node" callBack={handleNodeDropDownClick} spanText="Sat" />
      <DropdownMenu list={formationsList} dataKey="formation" callBack={handleFormationDropDownClick} spanText="F" />
    </div>
  );
};

GlobeToolbar.propTypes = {
  orbitsState: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default GlobeToolbar;
