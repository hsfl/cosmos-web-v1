const nodeList = {};
const realms = [];
const importRealms = (requireContext) => {
  requireContext.keys().forEach((key) => {
    const realmName = key.split('/')[1];
	const realm = requireContext(key);
	if(realm.hasOwnProperty('Layout')) {
		realms.push(realm.Layout);
		nodeList[realmName] = realm.NodeList;
	}
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
