import {
  secondsToMinute,
  mjdToUTCString,
} from '../../../utility/time';

export default {
  lg: [
    {
      i: 'satellite-neutron1-bbb-aa',
      x: 0,
      y: 0,
      w: 3,
      h: 12,
      component: {
        name: 'Image',
        props: {
          node: 'neutron1',
          name: 'BBB',
          file: 'BBB.png',
        },
      },
    },
    {
      i: 'satellite-neutron1-bbb-a',
      x: 3,
      y: 0,
      w: 3,
      h: 12,
      component: {
        name: 'AgentList',
        props: {
          node: 'beagle1',
        },
      },
    },
    {
      i: 'satellite-neutron1-bbb-b',
      x: 6,
      y: 0,
      w: 3,
      h: 12,
      component: {
        name: 'DisplayValue',
        props: {
          name: 'CPU',
          displayValues: [
            {
              name: 'CPU Load',
              nodeProcess: 'any',
              dataKey: 'device_cpu_load_000',
              timeDataKey: 'device_cpu_utc_000',
              unit: '',
              processDataKey: (x) => x.toFixed(2),
            },
            {
              name: 'CPU Uptime',
              nodeProcess: 'any',
              dataKey: 'device_cpu_uptime_000',
              timeDataKey: 'device_cpu_utc_000',
              unit: '',
              processDataKey: (x) => secondsToMinute(x),
            },
            {
              name: 'CPU Bootcount',
              nodeProcess: 'any',
              dataKey: 'device_cpu_boot_count_000',
              timeDataKey: 'device_cpu_utc_000',
              unit: '',
              processDataKey: (x) => x.toFixed(2),
            },
          ],
        },
      },
    },
    {
      i: 'satellite-neutron1-bbb-c',
      x: 9,
      y: 0,
      w: 3,
      h: 12,
      component: {
        name: 'DisplayValue',
        props: {
          name: 'Memory',
          displayValues: [
            {
              name: 'CPU GiB',
              nodeProcess: 'any',
              dataKey: 'device_cpu_gib_000',
              timeDataKey: 'device_cpu_utc_000',
              unit: '',
              processDataKey: (x) => x.toFixed(2),
            },
            {
              name: 'CPU Max GiB',
              nodeProcess: 'any',
              dataKey: 'device_cpu_maxgib_000',
              timeDataKey: 'device_cpu_utc_000',
              unit: '',
              processDataKey: (x) => x.toFixed(2),
            },
          ],
        },
      },
    },
    {
      i: 'satellite-neutron1-bbb-d',
      x: 0,
      y: 1,
      w: 6,
      h: 18,
      component: {
        name: 'Chart',
        props: {
          name: 'CPU',
          defaultRange: 'load',
          plots: [
            {
              x: [],
              y: [],
              type: 'scatter',
              marker: {
                color: 'red',
              },
              name: 'beagle1 Load',
              YDataKey: 'device_cpu_load_000',
              timeDataKey: 'device_cpu_utc_000',
              nodeProcess: 'any',
              processYDataKey: (x) => x,
              live: true,
            },
          ],
        },
      },
    },
    {
      i: 'satellite-neutron1-bbb-e',
      x: 0,
      y: 2,
      w: 12,
      h: 18,
      component: {
        name: 'Chart',
        props: {
          name: 'Boot Count',
          XDataKey: 'device_cpu_utc_000',
          processXDataKey: (x) => mjdToUTCString(x),
          plots: [
            {
              x: [],
              y: [],
              type: 'scatter',
              marker: {
                color: 'red',
              },
              name: 'beagle1 Boot Count',
              YDataKey: 'device_cpu_boot_count_000',
              timeDataKey: 'device_cpu_utc_000',
              processYDataKey: (x) => x,
              nodeProcess: 'any',
              live: true,
            },
          ],
        },
      },
    },
    {
      i: 'satellite-neutron1-bbb-f',
      x: 6,
      y: 1,
      w: 6,
      h: 18,
      component: {
        name: 'Chart',
        props: {
          name: 'Memory',
          plots: [
            {
              x: [],
              y: [],
              type: 'scatter',
              marker: {
                color: 'red',
              },
              name: 'beagle1 Storage (GiB)',
              YDataKey: 'device_cpu_gib_000',
              timeDataKey: 'device_cpu_utc_000',
              processYDataKey: (x) => x,
              nodeProcess: 'any',
              live: true,
            },
          ],
        },
      },
    },
  ],
};
