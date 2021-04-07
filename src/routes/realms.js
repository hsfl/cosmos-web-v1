import defaultLayout from './realms/defaultLayout';
import neutron1 from './realms/neutron1/index';
import hiapo from './realms/hiapo/index';
import hyti from './realms/hyti/index';

export default {
  name: 'Realms',
  icon: 'rocket',
  path: '/realm/:id',
  component: 'Dashboard',
  props: {
    defaultLayout,
    realms: {
      neutron1: ['neutron1', 'beagle1', 'virtualhost.hsfl.hawaii.edu', 'cubesat1'],
      hiapo: [],
      hyti: [],
    },
  },
  children: [
    neutron1,
    hiapo,
    hyti,
  ],
};
