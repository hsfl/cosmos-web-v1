import React, { useState, useEffect, useRef } from 'react';
import {
  Switch, Button, Badge,
} from 'antd';
import PropTypes from 'prop-types';
import { SettingOutlined } from '@ant-design/icons';

import ComponentSettings from './ComponentSettings';

const badgePadding = {
  marginTop: '0.18em',
};

const top = {
  top: 50,
};

/**
 * The wrapper component that has a header, content and settings modal.
 */
function BaseComponent({
  name,
  subheader,
  liveOnly,
  showStatus,
  status,
  children,
  formItems,
  handleLiveSwitchChange,
  toolsSlot,
  movable,
  // height,
}) {
  /** Handler for the widget settings modal */
  const [openSettings, setOpenSettings] = useState(false);

  /** Ref to obtain the height of header to subtract from whole component height */
  const headerRef = useRef(null);

  /** Detect when people use the live switch button */
  useEffect(() => {
    handleLiveSwitchChange(true);
  }, [handleLiveSwitchChange]);

  return (
    <div>
      <ComponentSettings
        visible={openSettings}
        /** Closes the modal. */
        closeModal={() => setOpenSettings(false)}
      >
        {formItems}
      </ComponentSettings>

      <div className={`sticky top-0 z-50 flex justify-between px-3 pt-2 dragHandle z-0 component-color ${movable ? 'cursor-move' : ''}`} ref={headerRef}>
        <div className="flex justify-between w-full">
          <div className="flex">
            {showStatus ? (
              <div style={badgePadding}>
                <Badge status={status} />
              </div>
            ) : null}

            {/* Title */}
            <div className="font-bold text-base">
              {name}
            </div>
          </div>

          {/* Settings / buttons for component */}
          <div>
            {!liveOnly ? (
              <span>
                <Switch
                  checkedChildren="Live"
                  unCheckedChildren="Past"
                  defaultChecked
                  onChange={(checked) => handleLiveSwitchChange(checked)}
                />
                &nbsp;
                &nbsp;
              </span>
            ) : null}

            <div>
              {
                toolsSlot
              }

              &nbsp;

              {formItems ? (
                <Button size="small" onClick={() => setOpenSettings(true)}>
                  <SettingOutlined />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* A description */}
      {
        subheader ? (
          <div
            className="sticky text-gray-600 text-sm preventDragHandle cursor-auto px-3 pb-2"
            style={top}
          >
            {subheader}
          </div>
        ) : null
      }
      {/* <div className="px-4 py-1 overflow-y-auto"
      style={{ height: headerRef && headerRef.current ?
      height - headerRef.current.clientHeight : height }}> */}

      {/* Main content of component */}
      <div className="px-4 py-1 overflow-y-scroll">
        {children}
      </div>
    </div>
  );
}

BaseComponent.propTypes = {
  /** Name of the component to display at the time */
  name: PropTypes.string,
  /** Supplementary information below the name */
  subheader: PropTypes.node,
  /** Whether the component can display only live data. Hides/shows the live/past switch. */
  liveOnly: PropTypes.bool,
  /** Function is run when the live/past switch is toggled. */
  handleLiveSwitchChange: ({ liveOnly }, propName, componentName) => {
    if (!liveOnly) {
      return new Error(
        `${propName} is required when showStatus is true in ${componentName}.`,
      );
    }

    return null;
  },
  /** Whether to show a circular indicator of the status of the component */
  showStatus: PropTypes.bool,
  /** The type of badge to show if showStatus is true (see the ant design badges component) */
  status: PropTypes.string,
  /** The main content of the component */
  children: PropTypes.node,
  /** Node containing form item components */
  formItems: PropTypes.node,
  /** Top right slot in header */
  toolsSlot: PropTypes.node,
  /** Draggable layout component */
  movable: PropTypes.bool,
  /** Height to control child content */
  // height: PropTypes.number,
};

BaseComponent.defaultProps = {
  name: '',
  subheader: null,
  showStatus: false,
  liveOnly: true,
  handleLiveSwitchChange: () => {},
  status: 'error',
  children: null,
  formItems: null,
  toolsSlot: null,
  movable: true,
  // height: 100,
};

export default BaseComponent;
