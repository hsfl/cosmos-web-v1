import React, {
  useState, useEffect, useReducer, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { message, Typography, Icon } from 'antd';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import {
  Context, actions, reducer,
} from '../store/neutron1';

import { socket } from '../socket';
// eslint-disable-next-line
import routes from '../routes';

import AsyncComponent from '../components/AsyncComponent';
import LayoutSelector from '../components/LayoutSelector';
import BaseComponent from '../components/BaseComponent';

const ResponsiveGridLayout = WidthProvider(Responsive);

function Dashboard({
  id,
  defaultLayout,
  path,
}) {
  /**
   * Store the agent statuses in the global store.
   */
  const [state, dispatch] = useReducer(reducer, {});

  /** Store the default page layout in case user wants to switch to it */
  const [defaultPageLayout, setDefaultPageLayout] = useState({
    lg: [],
  });

  const [defaultPageLayoutSimple, setDefaultPageLayoutSimple] = useState({
    lg: [],
  });

  /** Currently selected layout in use */
  const [layouts, setLayouts] = useState({
    lg: [],
  });

  const [socketStatus, setSocketStatus] = useState('error');

  const componentRefs = useRef([]);

  /** Get socket data from the agent */
  useEffect(() => {
    const live = socket('live', '/live/all');

    /** Get latest data from neutron1_exec */
    live.onmessage = ({ data }) => {
      try {
        const json = JSON.parse(data);

        dispatch(actions.get(json.node_type, json));
      } catch (err) {
        // console.log(err);
      }
    };

    live.onclose = () => {
      setSocketStatus('error');
    };

    live.onerror = () => {
      setSocketStatus('error');
    };

    live.onopen = () => {
      setSocketStatus('success');
    };

    return () => {
      live.close(1000);
    };
  }, []);

  /** Retrieve default layout for page */
  useEffect(() => {
    // By default, set the defaultLayout prop as a flive.ack if child doesn't have a layout set
    let layout = defaultLayout;

    // Find child route of dashboard and retrieve default layout
    routes.forEach((route) => {
      if (route.path === path && route.children) {
        route.children.forEach((child) => {
          // Get page layout from route config and save it into the state
          if (child.path.split('/')[1] === id && child.defaultLayout) {
            layout = child.defaultLayout;
            setDefaultPageLayout(child.defaultLayout);
          }

          // Get page layout simple from route config and save it into the state
          if (child.path.split('/')[1] === id && child.defaultLayoutSimple) {
            setDefaultPageLayoutSimple(child.defaultLayoutSimple);
          }
        });
      }
    });

    // Set timeout to let the grid initialize; won't work otherwise.
    setTimeout(() => {
      setLayouts(layout);
    }, 100);
  }, [defaultLayout, id, path]);

  /** Set the layout based on using the LayoutSelector function */
  const selectLayout = (layout) => {
    if (layout === 'defaultRouteLayout') {
      setLayouts(defaultLayout);
    } else if (layout === 'defaultPageLayout') {
      setLayouts(defaultPageLayout);
    } else if (layout === 'defaultPageLayoutSimple') {
      setLayouts(defaultPageLayoutSimple);
    } else {
      setLayouts(layout);
    }

    message.success('Successfully changed layout.');
  };

  return (
    <div className="mt-5 mx-16 mb-16">
      <div className="flex">
        <div className="w-1/2 shadow overflow-y-auto rounded component-color">
          <BaseComponent
            name="Layout Selection"
            movable={false}
          >
            <LayoutSelector
              path={path}
              selectLayout={(value) => selectLayout(value)}
            />
          </BaseComponent>
        </div>
        <div className="w-1/2 ml-3 shadow overflow-y-auto rounded component-color">
          <BaseComponent
            name="Socket Status"
            movable={false}
          >
            <Typography.Text type="secondary">
              {
                socketStatus === 'success'
                  ? (
                    <span>
                      {/* <Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" /> */}
                      &nbsp;Connected and operational.
                    </span>
                  )
                  : (
                    <span>
                      {/* <Icon type="close-circle" theme="twoTone" twoToneColor="#d80000" /> */}
                      &nbsp;&nbsp;No connection available. Attempting to reconnect.
                    </span>
                  )
              }
            </Typography.Text>
          </BaseComponent>
        </div>
      </div>
      <Context.Provider value={{ state, dispatch }}>
        <ResponsiveGridLayout
          className="layout"
          breakpoints={{
            lg: 996,
          }}
          cols={{
            lg: 12,
          }}
          layouts={layouts}
          margin={[12, 12]}
          draggableHandle=".dragHandle"
          draggableCancel=".preventDragHandle"
          rowHeight={20}
        >
          {
            layouts !== null
              && layouts.lg !== null
              ? layouts.lg
                .filter((layout) => layout && layout.i && layout.component && layout.component.name)
                .map((layout, i) => (
                  <div
                    className="shadow overflow-hidden rounded component-color"
                    ref={(el) => {
                      componentRefs.current[i] = el;
                    }}
                    key={layout.i}
                  >
                    <AsyncComponent
                      component={layout.component.name}
                      props={layout.component.props}
                      height={
                        componentRefs && componentRefs.current[i]
                          ? componentRefs.current[i].clientHeight
                          : 100
                      }
                    />
                  </div>
                )) : null
          }
        </ResponsiveGridLayout>
      </Context.Provider>
    </div>
  );
}

Dashboard.propTypes = {
  id: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  defaultLayout: PropTypes.shape({}).isRequired,
};

export default Dashboard;
