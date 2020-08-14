export default {
  lg: [
    {
      i: 'satellite-neutron1-adcscs-a',
      x: 0,
      y: 0,
      w: 6,
      h: 6,
      component: {
        name: 'DisplayValue',
        props: {
          name: 'Attitude',
          displayValues: [
            {
              name: 'Stars in View',
              nodeProcess: 'any',
              dataKey: 'placeholder',
              timeDataKey: 'placeholder',
              unit: '',
              processDataKey: (x) => x,
              live: true,
            },
            {
              name: 'Attitude Status',
              nodeProcess: 'any',
              dataKey: 'placeholder',
              timeDataKey: 'placeholder',
              unit: '',
              processDataKey: (x) => x,
              live: true,
            },
            {
              name: 'Attitude',
              nodeProcess: 'any',
              dataKey: 'placeholder',
              timeDataKey: 'placeholder',
              unit: '',
              processDataKey: (x) => JSON.stringify(x),
              live: true,
            },
            {
              name: 'Velocity',
              nodeProcess: 'any',
              dataKey: 'placeholder',
              timeDataKey: 'placeholder',
              unit: 'm/s',
              processDataKey: (x) => JSON.stringify(x),
              live: true,
            },
          ],
        },
      },
    },
    {
      i: 'satellite-neutron1-adcscs-b',
      x: 0,
      y: 1,
      w: 6,
      h: 21,
      component: {
        name: 'Attitude',
        props: {
          name: 'Attitude',
          attitudes: [
            {
              name: 'Cubestar',
              nodeProcess: 'any',
              dataKey: 'node_loc_att_icrf',
              quaternions: {
                d: {
                  x: 0,
                  y: 0,
                  z: 0,
                },
                w: 0,
              },
              live: true,
            },
          ],
        },
      },
    },
    {
      i: 'satellite-neutron1-adcscs-c',
      x: 6,
      y: 1,
      w: 6,
      h: 18,
      component: {
        name: 'Chart',
        props: {
          name: 'Attitude',
          plots: [
            {
              x: [],
              y: [],
              type: 'scatter',
              mode: 'lines+markers',
              marker: {
                color: 'red',
              },
              name: 'Attitude',
              YDataKey: 'placeholder',
              timeDataKey: 'placeholder',
              processYDataKey: (x) => x,
              nodeProcess: 'any',
              live: true,
            },
          ],
        },
      },
    },
    {
      i: 'satellite-neutron1-gps-g',
      x: 6,
      y: 2,
      w: 6,
      h: 18,
      component: {
        name: 'Chart',
        props: {
          name: 'Position',
          plots: [
            {
              x: [],
              y: [],
              type: 'scatter',
              mode: 'lines+markers',
              marker: {
                color: 'red',
              },
              name: 'Position X (m)',
              YDataKey: 'placeholder',
              timeDataKey: 'placeholder',
              processYDataKey: (x) => x[0],
              nodeProcess: 'any',
              live: true,
            },
            {
              x: [],
              y: [],
              type: 'scatter',
              mode: 'lines+markers',
              marker: {
                color: 'orange',
              },
              name: 'Position Y (m)',
              YDataKey: 'placeholder',
              timeDataKey: 'placeholder',
              processYDataKey: (x) => x[1],
              nodeProcess: 'any',
              live: true,
            },
            {
              x: [],
              y: [],
              type: 'scatter',
              mode: 'lines+markers',
              marker: {
                color: 'blue',
              },
              name: 'Position Z (m)',
              YDataKey: 'placeholder',
              timeDataKey: 'placeholder',
              processYDataKey: (x) => x[2],
              nodeProcess: 'any',
              live: true,
            },
          ],
        },
      },
    },
  ],
};
