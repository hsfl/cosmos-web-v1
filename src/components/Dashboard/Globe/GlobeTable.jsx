import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

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
    let lat;
    let lon;
    let alt;

    if (simulationEnabled && !orbit.live) {
      const idx = simCurrentIdx >= simData.data[simData.sats[orbit.nodeProcess]].length
        ? simData.data[simData.sats[orbit.nodeProcess]].length - 1
        : simCurrentIdx;
      x = simData.data[simData.sats[orbit.nodeProcess]][idx][simData.nameIdx[orbit.XDataKey]];
      y = simData.data[simData.sats[orbit.nodeProcess]][idx][simData.nameIdx[orbit.YDataKey]];
      z = simData.data[simData.sats[orbit.nodeProcess]][idx][simData.nameIdx[orbit.ZDataKey]];
      lat = 0;
      lon = 0;
      alt = 0;
    } else {
      x = orbit.position.x;
      y = orbit.position.y;
      z = orbit.position.z;
      lat = GetGeodetic(orbit) && GetGeodetic(orbit).latitude;
      lon = GetGeodetic(orbit) && GetGeodetic(orbit).longitude;
      alt = GetGeodetic(orbit) && GetGeodetic(orbit).height;
    }

    tableEntries.push(<td className="p-2 pr-8">{orbit.name}</td>);
    tableEntries.push(<td className="p-2 pr-8">{x && x.toFixed(2)}</td>);
    tableEntries.push(<td className="p-2 pr-8">{y && y.toFixed(2)}</td>);
    tableEntries.push(<td className="p-2 pr-8">{z && z.toFixed(2)}</td>);
    tableEntries.push(<td className="p-2 pr-8">{lat && lat.toFixed(2)}</td>);
    tableEntries.push(<td className="p-2 pr-8">{lon && lon.toFixed(2)}</td>);
    tableEntries.push(<td className="p-2 pr-8">{alt && alt.toFixed(2)}</td>);

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
            <td className="p-2 pr-8">Latitude (rad)</td>
            <td className="p-2 pr-8">Longitude (rad)</td>
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
