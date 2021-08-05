import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Cartesian3, Cartographic } from 'cesium';

/* Manage Globe's timeline */
const GlobeTable = ({
  orbitsState,
  simulationEnabled,
}) => {
  const simData = useSelector((s) => s.simData);
  const simCurrentIdx = useSelector((s) => s.simCurrentIdx);

  /** Return whichever geodetic coordinates are defined */
  function GetGeodetic(orbit) {
    // Grab values from simData
    if (simulationEnabled && !orbit.live) {

    }
    if (orbit.geodetic) {
      return orbit.geodetic;
    } if (orbit.posGeod) {
      return orbit.posGeod;
    }
    return 0;
  }

  const GlobeTableEntry = (orbit) => {
    const tableEntries = [];
    let x;
    let y;
    let z;

    if (simulationEnabled && !orbit.live) {
      const idx = simCurrentIdx >= simData.data[simData.sats[orbit.nodeProcess]].length
        ? simData.data[simData.sats[orbit.nodeProcess]].length - 1
        : simCurrentIdx;
      x = simData.data[simData.sats[orbit.nodeProcess]][idx][simData.nameIdx[orbit.XDataKey]];
      y = simData.data[simData.sats[orbit.nodeProcess]][idx][simData.nameIdx[orbit.YDataKey]];
      z = simData.data[simData.sats[orbit.nodeProcess]][idx][simData.nameIdx[orbit.ZDataKey]];
    } else {
      x = orbit.position.x;
      y = orbit.position.y;
      z = orbit.position.z;
    }
    const posGeod =
      (x !== undefined
        && y !== undefined
        && z !== undefined)
        ? Cartographic.fromCartesian(Cartesian3.fromArray([x, y, z]))
        : undefined;

    tableEntries.push(<td key={`${orbit.name}_te_name`} className="p-2 pr-8">{orbit.name}</td>);
    tableEntries.push(<td key={`${orbit.name}_te_x`} className="p-2 pr-8">{x && x.toFixed(2)}</td>);
    tableEntries.push(<td key={`${orbit.name}_te_y`} className="p-2 pr-8">{y && y.toFixed(2)}</td>);
    tableEntries.push(<td key={`${orbit.name}_te_z`} className="p-2 pr-8">{z && z.toFixed(2)}</td>);
    tableEntries.push(<td key={`${orbit.name}_te_lat`} className="p-2 pr-8">{posGeod && (posGeod.latitude / Math.PI * 180).toFixed(2)}</td>);
    tableEntries.push(<td key={`${orbit.name}_te_lon`} className="p-2 pr-8">{posGeod && (posGeod.longitude / Math.PI * 180).toFixed(2)}</td>);
    tableEntries.push(<td key={`${orbit.name}_te_alt`} className="p-2 pr-8">{posGeod && posGeod.height.toFixed(2)}</td>);

    return (
      <tr className="text-gray-700 border-b border-gray-400" key={orbit.name}>
        {tableEntries}
      </tr>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="mt-4 w-full">
        <tbody className="w-10">
          <tr className="bg-gray-200 border-b border-gray-400">
            <td className="p-2 pr-8">Name</td>
            <td className="p-2 pr-8">x (m)</td>
            <td className="p-2 pr-8">y (m)</td>
            <td className="p-2 pr-8">z (m)</td>
            <td className="p-2 pr-8">Latitude (deg)</td>
            <td className="p-2 pr-8">Longitude (deg)</td>
            <td className="p-2 pr-8">Altitude (m)</td>
          </tr>
          {
            orbitsState.map((orbit) => GlobeTableEntry(orbit))
          }
        </tbody>
      </table>
    </div>
  );
};

GlobeTable.propTypes = {
  orbitsState: PropTypes.arrayOf(PropTypes.shape).isRequired,
  simulationEnabled: PropTypes.bool.isRequired,
};

export default GlobeTable;
