import defaultLayout from './realms/defaultLayout';

const nodeList = {};
const realms = [];
const importRealms = (requireContext) => {
  requireContext.keys().forEach((key) => {
    nodeList[key] = requireContext(key).NodeList;
    realms.push(requireContext(key).Layout);
  });
};
importRealms(require.context('./realms', true, /index\.js$/));

export default {
  name: 'Realms',
  icon: 'rocket',
  path: '/realm/:id',
  component: 'Dashboard',
  props: {
    defaultLayout,
    realms: nodeList,
  },
  children: realms,
};
