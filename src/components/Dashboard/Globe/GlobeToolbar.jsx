import React from 'react';
import PropTypes from 'prop-types';
import Cesium from 'cesium';
import { CesiumContext } from 'resium';

const GlobeToolbar = ({
  orbitsState,
}) => {
  const cesium = React.useContext(CesiumContext);

  return (
    <div className="globetoolbar">
      <button
        type="button"
        className="globetoolbar-button"
        onClick={() => {
          if (!cesium || !cesium.viewer) return;
          if (orbitsState === undefined || orbitsState.length === 0) return;
          const posGeod = { ...orbitsState[0].posGeod };
          posGeod.height += 200000;
          cesium.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromRadians(...Object.values(posGeod)),
          });
        }}
      >
        Sat
      </button>
    </div>
  );
};

GlobeToolbar.propTypes = {
  orbitsState: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default GlobeToolbar;
