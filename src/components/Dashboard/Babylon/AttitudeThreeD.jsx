import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Mesh, Quaternion, Vector3 } from '@babylonjs/core';
import '@babylonjs/loaders';

import BabylonScene from './BabylonScene';
import AttitudeSceneInitializer from './AttitudeSceneInitializer';

const AttitudeThreeD = ({
  vectors,
  quaternions,
}) => {
  const cubesatMesh = useRef(null);
  const nadirVector = useRef(null);
  const targetVector = useRef(null);
  const targetVectorDesired = useRef(null);

  useEffect(() => {
    if (vectors === undefined || quaternions === undefined) {
      return;
    }
    // Sat does not rotate in body frame
    /* if (cubesatMesh.current !== null) {
      cubesatMesh.current.rotationQuaternion = new Quaternion(
        satAttitude.d.x,
        satAttitude.d.y,
        satAttitude.d.z,
        satAttitude.w,
      );
    } */
    // Nadir vector
    if (nadirVector.current !== null) {
      const points = [
        Vector3.Zero(),
        new Vector3(...vectors[0].vector),
      ];
      nadirVector.current = Mesh.CreateLines(
        null, points, null, null, nadirVector.current,
      );
      const quaternion = new Quaternion(
        quaternions[vectors[0].quaternion].d.x,
        quaternions[vectors[0].quaternion].d.y,
        quaternions[vectors[0].quaternion].d.z,
        quaternions[vectors[0].quaternion].w,
      );
      nadirVector.current.rotationQuaternion = Quaternion.Inverse(quaternion);
    }
    // Target vector
    if (targetVector.current !== null) {
      const points = [
        Vector3.Zero(),
        new Vector3(...vectors[1].vector),
      ];
      targetVector.current = Mesh.CreateLines(
        null, points, null, null, targetVector.current,
      );
      const quaternion = new Quaternion(
        quaternions[vectors[1].quaternion].d.x,
        quaternions[vectors[1].quaternion].d.y,
        quaternions[vectors[1].quaternion].d.z,
        quaternions[vectors[1].quaternion].w,
      );
      targetVector.current.rotationQuaternion = Quaternion.Inverse(quaternion);
    }
    // Target vector desired
    if (targetVectorDesired.current !== null) {
      const points = [
        Vector3.Zero(),
        new Vector3(...vectors[2].vector),
      ];
      targetVectorDesired.current = Mesh.CreateLines(
        null, points, null, null, targetVectorDesired.current,
      );
      const quaternion = new Quaternion(
        quaternions[vectors[2].quaternion].d.x,
        quaternions[vectors[2].quaternion].d.y,
        quaternions[vectors[2].quaternion].d.z,
        quaternions[vectors[2].quaternion].w,
      );
      targetVectorDesired.current.rotationQuaternion = Quaternion.Inverse(quaternion);
    }
  }, [vectors, quaternions]);

  return (
    <BabylonScene
      onSceneReady={
        AttitudeSceneInitializer(
          cubesatMesh,
          nadirVector,
          targetVector,
          targetVectorDesired,
        )
      }
    />
  );
};

AttitudeThreeD.propTypes = {
  /** Vectors to display */
  vectors: PropTypes.arrayOf(
    PropTypes.shape({
      vector: PropTypes.shape({
        d: PropTypes.shape({
          x: PropTypes.number,
          y: PropTypes.number,
          z: PropTypes.number,
        }),
        w: PropTypes.number,
      }),
      quaternion: PropTypes.string,
    }),
  ),
  /** Quaternion to irotate from eci to body frame */
  quaternions: PropTypes.shape({
    sat: PropTypes.arrayOf(PropTypes.string),
    // ... more quaternions to be added as specified
  })
};

AttitudeThreeD.defaultProps = {
  targetAttitude: null,
};

export default AttitudeThreeD;
