import defaultLayout from './realms/defaultLayout';
import neutron1 from './realms/neutron1';
import hiapo from './realms/hiapo';
import hyti from './realms/hyti';
import sttr_2020 from './realms/sttr_2020';

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
	  sttr_2020: ['mothership', 'daughter_01', 'daughter_02', 'daughter_03', 'daughter_04'],
    },
  },
  children: [
    neutron1,
    hiapo,
    hyti,
	sttr_2020,
  ],
};
