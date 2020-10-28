import Home from './home';
import CEO from './ceo';
import Realms from './realms';
// import Scheduler from './scheduler';
import GroundStations from './ground-stations';
import DashboardManager from './dashboard-manager';
import Public from './public';

const nonPublic = {
  CEO,
  Realms,
  GroundStations,
  // Scheduler,
  DashboardManager,
};

const routes = [
  Home,
];

// For static public facing website, otherwise render normal pages
if (process.env.PUBLIC_MODE === 'true') {
  routes.push(Public);
} else {
  routes.push(...nonPublic);
}

export default routes;
