import {
  secondsToMinute,
  mjdToUTCString,
} from '../../../utility/time';

export default {
  lg: [
    {
      i: 'satellite-neutron1-obc-aa',
      x: 0,
      y: 0,
      w: 3,
      h: 14,
      component: {
        name: 'Image',
        props: {
          node: 'neutron1',
          name: 'OBC',
          file: 'OBC.png',
        },
      },
    },
    {
      i: 'satellite-neutron1-obc-a',
      x: 3,
      y: 0,
      w: 3,
      h: 14,
      component: {
        name: 'AgentList',
        props: {
          node: 'neutron1',
        },
      },
    },
    {
      i: 'satellite-neutron1-obc-b',
      x: 6,
      y: 0,
      w: 6,
      h: 7,
      component: {
        name: 'DisplayValue',
        props: {
          name: 'CPU',
          displayValues: [
            {
              name: 'CPU Load',
              nodeProcess: 'any',
              dataKey: 'device_cpu_load_003',
              timeDataKey: 'device_cpu_utc_003',
              unit: '',
              processDataKey: (x) => x.toFixed(2),
            },
            {
              name: 'CPU Uptime',
              nodeProcess: 'any',
              dataKey: 'device_cpu_uptime_003',
              timeDataKey: 'device_cpu_utc_003',
              unit: '',
              processDataKey: (x) => secondsToMinute(x),
            },
            {
              name: 'CPU Bootcount',
              nodeProcess: 'any',
              dataKey: 'device_cpu_boot_count_003',
              timeDataKey: 'device_cpu_utc_003',
              unit: '',
              processDataKey: (x) => x.toFixed(2),
            },
          ],
        },
      },
    },
    {
      i: 'satellite-neutron1-obc-c',
      x: 6,
      y: 1,
      w: 6,
      h: 7,
      component: {
        name: 'DisplayValue',
        props: {
          name: 'Memory',
          displayValues: [
            {
              name: 'OBC Storage (GiB)',
              nodeProcess: 'any',
              dataKey: 'device_cpu_gib_003',
              timeDataKey: 'device_cpu_utc_003',
              unit: '',
              processDataKey: (x) => x.toFixed(2),
            },
            {
              name: 'CPU Max Storage (GiB)',
              nodeProcess: 'any',
              dataKey: 'device_cpu_maxgib_003',
              timeDataKey: 'device_cpu_utc_003',
              unit: '',
              processDataKey: (x) => x.toFixed(2),
            },
          ],
        },
      },
    },
    {
      i: 'satellite-neutron1-obc-d',
      x: 0,
      y: 2,
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
              name: 'neutron1 Load',
              YDataKey: 'device_cpu_load_003',
              timeDataKey: 'device_cpu_utc_003',
              processYDataKey: (x) => x,
              nodeProcess: 'any',
              live: true,
            },
          ],
        },
      },
    },
    {
      i: 'satellite-neutron1-obc-e',
      x: 6,
      y: 2,
      w: 6,
      h: 18,
      component: {
        name: 'Chart',
        props: {
          name: 'Memory',
          processXDataKey: (x) => mjdToUTCString(x),
          plots: [
            {
              x: [],
              y: [],
              type: 'scatter',
              marker: {
                color: 'red',
              },
              name: 'neutron1 Storage (GiB)',
              YDataKey: 'device_cpu_gib_003',
              timeDataKey: 'device_cpu_utc_003',
              processYDataKey: (x) => x,
              nodeProcess: 'any',
              live: true,
            },
          ],
        },
      },
    },
    {
      i: 'satellite-neutron1-obc-f',
      x: 0,
      y: 3,
      w: 12,
      h: 18,
      component: {
        name: 'Chart',
        props: {
          name: 'Boot Count',
          plots: [
            {
              x: [],
              y: [],
              type: 'scatter',
              marker: {
                color: 'red',
              },
              name: 'neutron1 Boot Count',
              YDataKey: 'device_cpu_boot_count_003',
              timeDataKey: 'device_cpu_utc_003',
              processYDataKey: (x) => x,
              XDataKey: 'timeDataKey',
              nodeProcess: 'any',
              live: true,
            },
          ],
        },
      },
    },
  ],
};
