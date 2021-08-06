import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Quaternion, } from '@babylonjs/core';
import '@babylonjs/loaders';

import BabylonScene from './BabylonScene';
import AttitudeSceneInitializer from './AttitudeSceneInitializer';

const AttitudeThreeD = ({
  data,
}) => {
  const cubesatMesh = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setAttitude((a) => a + 1), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (cubesatMesh.current !== null) {
      cubesatMesh.current.rotationQuaternion = new Quaternion(
        data.d.x,
        data.d.y,
        data.d.z,
        data.w,
      );
    }
  }, [data]);

  return (
    <BabylonScene onSceneReady={AttitudeSceneInitializer(cubesatMesh)} />
  );
};

AttitudeThreeD.propTypes = {
  data: PropTypes.shape({
    d: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
      z: PropTypes.number,
    }),
    w: PropTypes.number,
  }).isRequired,
};

export default AttitudeThreeD;
