import React, { createRef, useEffect, useMemo, useRef } from 'react';
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
  // All vectors that are relative to the body frame
  const satVectors = useMemo(() => Array.from(
      { length: vectors !== undefined ? vectors.length : 0 },
    ).map(
      () => createRef()
    ), [vectors.length]);

  useEffect(() => {
    if (vectors.length === 0 || quaternions === undefined || satVectors.length === 0) {
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
    // Update body frame vectors
    satVectors.forEach((v, i) => {
      const vref = v;
      const points = [
        Vector3.Zero(),
        new Vector3(...vectors[i].vector),
      ];
      vref.current = Mesh.CreateLines(
        null, points, null, null, vref.current,
      );
      const quaternion = new Quaternion(
        quaternions[vectors[i].quaternion].d.x,
        quaternions[vectors[i].quaternion].d.y,
        quaternions[vectors[i].quaternion].d.z,
        quaternions[vectors[i].quaternion].w,
      );
      vref.current.rotationQuaternion = quaternion.conjugate();
    });
  }, [vectors, quaternions, satVectors]);

  return (
    <BabylonScene
      onSceneReady={
        AttitudeSceneInitializer(
          cubesatMesh,
          satVectors,
          vectors?.length,
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
  vectors: [],
  quaternions: undefined,
};

export default AttitudeThreeD;
