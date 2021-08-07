import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Quaternion } from '@babylonjs/core';
import '@babylonjs/loaders';

import BabylonScene from './BabylonScene';
import AttitudeSceneInitializer from './AttitudeSceneInitializer';

const AttitudeThreeD = ({
  satAttitude,
  targetAttitude,
}) => {
  const cubesatMesh = useRef(null);
  const attitudeVector = useRef(null);
  const targetVector = useRef(null);

  useEffect(() => {
    if (cubesatMesh.current !== null) {
      cubesatMesh.current.rotationQuaternion = new Quaternion(
        satAttitude.d.x,
        satAttitude.d.y,
        satAttitude.d.z,
        satAttitude.w,
      );
    }
    if (attitudeVector.current !== null) {
      attitudeVector.current.rotationQuaternion = new Quaternion(
        satAttitude.d.x,
        satAttitude.d.y,
        satAttitude.d.z,
        satAttitude.w,
      );
    }
  }, [satAttitude]);

  useEffect(() => {
    if (targetVector.current !== null && targetAttitude != null) {
      targetVector.current.rotationQuaternion = new Quaternion(
        targetAttitude.d.x,
        targetAttitude.d.y,
        targetAttitude.d.z,
        targetAttitude.w,
      );
    }
  }, [targetAttitude]);

  return (
    <BabylonScene
      onSceneReady={
        AttitudeSceneInitializer(
          cubesatMesh,
          attitudeVector,
          targetVector,
        )
      }
    />
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
  targetAttitude: PropTypes.shape({
    d: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
      z: PropTypes.number,
    }),
    w: PropTypes.number,
  }),
};

AttitudeThreeD.defaultProps = {
  targetAttitude: null,
};

export default AttitudeThreeD;
