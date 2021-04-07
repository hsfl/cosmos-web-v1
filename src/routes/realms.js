import defaultLayout from './realms/defaultLayout';
import { Layout as neutron1 } from './realms/neutron1/index';
import { Layout as hiapo } from './realms/hiapo/index';
import { Layout as hyti } from './realms/hyti/index';

const realms = {
  layout : [],
  realms :{}
}
async function importRealm(realmID) {
  let { Layout, NodeList } = await import(`./realms/${realmID}/index`);
  realms.layout.push(layout);
  realms.realms[realmID] = NodeList;
}
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
