export default {
  lg: [
    {
      i: 'satellite-neutron1-payload-d',
      x: 0,
      y: 0,
      w: 3,
      h: 14,
      component: {
        name: 'Image',
        props: {
          node: 'neutron1',
          name: 'ASU Payload',
          file: 'ASU-Payload.png',
        },
      },
    },
    {
      i: 'satellite-neutron1-payload-a',
      x: 3,
      y: 0,
      w: 4,
      h: 14,
      component: {
        name: 'Replacement',
      },
    },
    {
      i: 'satellite-neutron1-payload-b',
      x: 8,
      y: 0,
      w: 5,
      h: 7,
      component: {
        name: 'DisplayValue',
        props: {
          name: 'Payload Pwr',
          displayValues: [
            {
              name: 'Pwr',
              nodeProcess: 'any',
              dataKey: 'device_pload_power_000',
              timeDataKey: 'device_pload_utc_000',
              unit: 'W',
              processDataKey: (x) => Math.abs(x.toFixed(2)),
            },
          ],
        },
      },
    },
    {
      i: 'satellite-neutron1-payload-c',
      x: 8,
      y: 0,
      w: 5,
      h: 7,
      component: {
        name: 'DisplayValue',
        props: {
          name: 'Payload Temperature',
          displayValues: [
            {
              name: 'Temperature',
              nodeProcess: 'any',
              dataKey: 'device_pload_temp_000',
              timeDataKey: 'device_pload_utc_000',
              unit: 'C',
              processDataKey: (x) => (x - 273.15).toFixed(2),
              processSecondaryDataKey: (x) => `${x.toFixed(2)}K`,
            },
          ],
        },
      },
    },
  ],
};
