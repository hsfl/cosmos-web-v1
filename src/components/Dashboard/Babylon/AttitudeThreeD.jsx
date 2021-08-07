import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Quaternion, } from '@babylonjs/core';
import '@babylonjs/loaders';

import BabylonScene from './BabylonScene';
import AttitudeSceneInitializer from './AttitudeSceneInitializer';

const AttitudeThreeD = ({
  satAttitude,
}) => {
  const cubesatMesh = useRef(null);

  useEffect(() => {
    if (cubesatMesh.current !== null) {
      cubesatMesh.current.rotationQuaternion = new Quaternion(
        satAttitude.d.x,
        satAttitude.d.y,
        satAttitude.d.z,
        satAttitude.w,
      );
    }
  }, [satAttitude]);

  return (
    <BabylonScene onSceneReady={AttitudeSceneInitializer(cubesatMesh)} />
  );
};

AttitudeThreeD.propTypes = {
  satAttitude: PropTypes.shape({
    d: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
      z: PropTypes.number,
    }),
    w: PropTypes.number,
  }).isRequired,
  targAttitude: PropTypes.shape({
    d: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
      z: PropTypes.number,
    }),
    w: PropTypes.number,
  }),
};

AttitudeThreeD.defaultProps = {
  targAttitude: null,
};

export default AttitudeThreeD;
