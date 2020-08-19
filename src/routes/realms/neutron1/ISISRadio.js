import { onOff, txRx } from '../../../utility/definition';
import { secondsToMinute } from '../../../utility/time';

export default {
  lg: [
    {
      i: 'satellite-neutron1-isis-a',
      x: 0,
      y: 0,
      w: 3,
      h: 12,
      component: {
        name: 'Image',
        props: {
          node: 'neutron1',
          name: 'ISIS Radio',
          file: 'ISIS-Radio.png',
        },
      },
    },
    {
      i: 'satellite-neutron1-isis-b',
      x: 3,
      y: 0,
      w: 3,
      h: 12,
      component: {
        name: 'DisplayValue',
        props: {
          name: 'General Status',
          displayValues: [
            {
              name: 'Status',
              nodeProcess: 'any',
              dataKey: 'placeholder',
              unit: '',
              processDataKey: (x) => x,
              processSecondaryData: (x) => onOff(x),
            },
            {
              name: 'Mode',
              nodeProcess: 'any',
              dataKey: 'placeholder',
              unit: '',
              processDataKey: (x) => x,
              processSecondaryData: (x) => txRx(x),
            },
          ],
        },
      },
    },
    {
      i: 'satellite-neutron1-isis-c',
      x: 6,
      y: 0,
      w: 3,
      h: 12,
      component: {
        name: 'DisplayValue',
        props: {
          name: 'TX Status',
          displayValues: [
            {
              name: 'Uptime',
              nodeProcess: 'any',
              dataKey: 'placeholder',
              unit: 's',
              processDataKey: (x) => x,
              processSecondaryData: (x) => secondsToMinute(x),
            },
            {
              name: 'Beacon State',
              nodeProcess: 'any',
              dataKey: 'placeholder',
              unit: '',
              processDataKey: (x) => x,
              processSecondaryData: (x) => onOff(x),
            },
            {
              name: 'Total Supply Current',
              nodeProcess: 'any',
              dataKey: 'placeholder',
              unit: 'A',
              processDataKey: (x) => Math.abs(x.toFixed(4)),
            },
            {
              name: 'Transmitter Current',
              nodeProcess: 'any',
              dataKey: 'placeholder',
              unit: 'A',
              processDataKey: (x) => Math.abs(x.toFixed(4)),
            },
          ],
        },
      },
    },
    {
      i: 'satellite-neutron1-isis-d',
      x: 9,
      y: 0,
      w: 3,
      h: 12,
      component: {
        name: 'DisplayValue',
        props: {
          name: 'RX Status',
          displayValues: [
            {
              name: 'Uptime',
              nodeProcess: 'any',
              dataKey: 'placeholder',
              unit: 's',
              processDataKey: (x) => x,
              processSecondaryData: (x) => secondsToMinute(x),
            },
            {
              name: 'RSSI',
              nodeProcess: 'any',
              dataKey: 'placeholder',
              unit: '',
              processDataKey: (x) => x,
            },
            {
              name: 'Total Supply Current',
              nodeProcess: 'any',
              dataKey: 'placeholder',
              unit: 'A',
              processDataKey: (x) => Math.abs(x.toFixed(4)),
            },
            {
              name: 'Power Amplifier Current',
              nodeProcess: 'any',
              dataKey: 'placeholder',
              unit: 'A',
              processDataKey: (x) => Math.abs(x.toFixed(4)),
            },
          ],
        },
      },
    },
    {
      i: 'satellite-neutron1-commands-e',
      x: 0,
      y: 1,
      w: 12,
      h: 14,
      component: {
        name: 'Commands',
        props: {
          defaultNodeProcess: 'neutron1:radio_trxvu_ground_sim',
          nodes: ['neutron1', 'beagle1'],
        },
      },
    },
  ],
};
