import React from 'react';
import { Router } from '@reach/router';

import Navbar from './components/Global/Navbar';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Scheduler from './pages/Scheduler';
import DashboardManager from './pages/DashboardManager';
import CEO from './pages/CEO';

import FourOhFour from './pages/404';
import routes from './routes';

const components = {
  Home,
  Dashboard,
  Scheduler,
  DashboardManager,
  CEO,
};

const App = () => (
  <div>
    <header>
      <Navbar current="home" />
    </header>
    <Router>
      <FourOhFour default />
      {
        routes.map((route) => {
          const Component = components[route.component];

          return (
            <Component
              id={route.path}
              key={route.path}
              path={route.path}
              name={route.name}
              // eslint-disable-next-line
              {...route.props}
            />
          );
        })
      }
    </Router>
  </div>
);

export default App;
