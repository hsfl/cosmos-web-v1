export default {
  lg: [
    {
      i: 'satellite-neutron1-commands-c',
      x: 0,
      y: 0,
      w: 12,
      h: 10,
      component: {
        name: 'CommandEditor',
        props: {
          nodes: ['neutron1', 'beagle1'],
        },
      },
    },
    {
      i: 'satellite-neutron1-commands-a',
      x: 0,
      y: 1,
      w: 12,
      h: 10,
      component: {
        name: 'MissionEventsDisplay',
        props: {
          nodes: ['neutron1', 'beagle1'],
        },
      },
    },
    {
      i: 'satellite-neutron1-commands-ab',
      x: 0,
      y: 2,
      w: 12,
      h: 10,
      component: {
        name: 'QueuedEvents',
      },
    },
    {
      i: 'satellite-neutron1-commands-b',
      x: 0,
      y: 10,
      w: 12,
      h: 15,
      component: {
        name: 'Commands',
        props: {
          nodes: ['neutron1', 'beagle1'],
        },
      },
    },
  ],
};
