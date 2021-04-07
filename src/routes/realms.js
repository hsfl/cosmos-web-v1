import defaultLayout from './realms/defaultLayouts/defaultLayout';

// Use require.context to get an array of file paths to .js files in the ./realms subdirectory, no recursion
const importRealms = require.context('./realms', false, /\w+\.js$/);
// import specified file at the filepaths
const realms = importRealms.keys().map((filePath) => {
	const realm = importRealms(filePath);
	return realm.default;
});

// Create an object where the keys are the realm names and the values are their nodes
const nodes = Object.fromEntries(realms.map((realm) => {
	if(realm.hasOwnProperty('nodes')) {
		return [realm.name, realm.nodes];
	} else {
		return [realm.name, []];
	}
}));

export default {
  name: 'Realms',
  icon: 'rocket',
  path: '/realm/:id',
  component: 'Dashboard',
  props: {
    defaultLayout,
    realms: nodes,
  },
  children: realms,
};
