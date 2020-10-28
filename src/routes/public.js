import defaultLayout from './realms/defaultLayout';
import neutron1 from './realms/n1mission';

export default {
  name: 'Missions',
  icon: 'rocket',
  path: '/public/:id',
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
  ],
};
