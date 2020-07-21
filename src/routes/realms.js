import defaultLayout from './realms/defaultLayout';
import neutron1 from './realms/neutron1';
import hiapo from './realms/hiapo';
import hyti from './realms/hyti';

export default {
  name: 'Realms',
  icon: 'rocket',
  path: '/realm/:id',
  component: 'Dashboard',
  props: {
    defaultLayout,
    realms: {
      neutron1: ['neutron1', 'beagle1'],
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
