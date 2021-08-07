import React, { useEffect, useRef } from 'react';
import { Engine, Scene } from '@babylonjs/core';
import PropTypes from 'prop-types';

const BabylonScene = ({
  onRender,
  onSceneReady,
}) => {
  const reactCanvas = useRef(null);

  useEffect(() => {
    if (reactCanvas.current) {
      const engine = new Engine(reactCanvas.current);
      const scene = new Scene(engine);
      if (scene.isReady()) {
        onSceneReady(scene);
      } else {
        scene.onReadyObservable.addOnce((s) => onSceneReady(s));
      }

      engine.runRenderLoop(() => {
        if (typeof onRender === 'function') {
          onRender(scene);
        }
        scene.render();
      });

      const resize = () => {
        scene.getEngine().resize();
      };

      if (window) {
        window.addEventListener('resize', resize);
      }

      return () => {
        scene.getEngine().dispose();

        if (window) {
          window.removeEventListener('resize', resize);
        }
      };
    }
    return null;
  }, [reactCanvas, onSceneReady, onRender]);

  return <canvas id="scene" ref={reactCanvas} />;
};

BabylonScene.propTypes = {
  onRender: PropTypes.func,
  onSceneReady: PropTypes.func.isRequired,
};

BabylonScene.defaultProps = {
  onRender: null,
};

export default React.memo(BabylonScene);
