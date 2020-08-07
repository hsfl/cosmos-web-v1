import React from 'react';

import BaseComponent from '../BaseComponent';
import Table from '../Global/Table';

/**
 * Displays required data for a future pass of a satellite.
 */
function SatellitePasses() {
  return (
    <BaseComponent
      name="Satellite Passes"
    >
      <Table
        columns={[
          {
            title: 'Time',
            key: 'time',
          },
          {
            title: 'Azimuth',
            key: 'azimuth',
          },
          {
            title: 'Elevation',
            key: 'elevation',
          },
          {
            title: 'Range',
            key: 'range',
          },
          {
            title: 'Footprint',
            key: 'footprint',
          },
        ]}
        data={[
          {
            time: '2019-10-08 21:13:12',
            azimuth: '295.87',
            elevation: '1.15',
            range: '2654',
            footprint: '5236',
          },
          {
            time: '2019-10-08 21:13:12',
            azimuth: '295.87',
            elevation: '1.15',
            range: '2654',
            footprint: '5236',
          },
          {
            time: '2019-10-08 21:13:12',
            azimuth: '295.87',
            elevation: '1.15',
            range: '2654',
            footprint: '5236',
          },
        ]}
      />
    </BaseComponent>
  );
}

export default SatellitePasses;
