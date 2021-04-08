const nodeList = {};
const realms = [];
const importRealms = (requireContext) => {
  requireContext.keys().forEach((key) => {
    const realmName = key.split('/')[1];
    nodeList[realmName] = requireContext(key).NodeList;
    realms.push(requireContext(key).Layout);
  });
};
// import index.js in realms directory
importRealms(require.context('../../external', true, /index\.js$/));

export default {
  name: 'Realms',
  icon: 'rocket',
  path: '/realm/:id',
  component: 'Dashboard',
  props: {
    defaultLayout: {},
    realms: nodeList,
  },
  children: realms,
};
