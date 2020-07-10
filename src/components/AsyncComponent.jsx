import React from 'react';
import PropTypes from 'prop-types';

import Activity from './Dashboard/Activity';
import Attitude from './Dashboard/Attitude';
import Chart from './Dashboard/Chart';
import Contact from './Dashboard/Contact';
import Commands from './Dashboard/Commands';
import DisplayValue from './Dashboard/DisplayValue';
import Events from './Dashboard/Events';
import Globe from './Dashboard/Globe';
import Macro from './Dashboard/Macro';
import MissionEventsDisplay from './Dashboard/MissionEventsDisplay';
import Replacement from './Dashboard/Replacement';
import SatellitePasses from './Dashboard/SatellitePasses';
import SetValues from './Dashboard/SetValues';
import Sequence from './Dashboard/Sequence';
import SOH from './Dashboard/SOH';
import Status from './Dashboard/Status';
import Subsystem from './Dashboard/Subsystem';
import ThreeD from './Dashboard/ThreeD';
import UploadFile from './Dashboard/UploadFile';

/** Store all of the available dashboard components into an object
 * This should contain all components that the dashboard should be able to render in the layout.
 */
export const components = {
  Activity,
  Attitude,
  Chart,
  Contact,
  Commands,
  DisplayValue,
  Events,
  Globe,
  Macro,
  MissionEventsDisplay,
  Replacement,
  SatellitePasses,
  SetValues,
  Sequence,
  SOH,
  Status,
  Subsystem,
  ThreeD,
  UploadFile,
};

/**
 * A wrapper component for dynamically rendering components into the dashboard layout pages
 * such as in /pages/Dashboard.jsx.
 */
function AsyncComponent({ component, props, height }) {
  // Dynamically choose the component to render based on the component prop being passed in
  const Component = components[component];

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Component {...props} height={height} />;
}

AsyncComponent.propTypes = {
  /** The name of the component to render */
  component: PropTypes.string.isRequired,
  /** The props to pass into the component on render */
  props: PropTypes.shape({}),
  /** The height obtained from the ref to dynamically set height */
  height: PropTypes.number,
};

AsyncComponent.defaultProps = {
  props: {},
  height: 300,
};

export default AsyncComponent;
