import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Badge, Switch } from 'antd';
import ActivityTable from './Activity/ActivityTable';
import BaseComponent from '../BaseComponent';

/**
 * Shows the incoming activity from the web socket and displays time elapsed
 * from the last data retrieval.
 */
function Activity({
  height,
}) {
  const [toggle, setToggle] = useState(true);

  return (
    <BaseComponent
      name="Activity"
      liveOnly
      toolsSlot={(
        <>
          <span className="mr-3">
            <Badge status="success" />
            &#60;&nbsp;5min
          </span>
          <span className="mr-3">
            <Badge status="warning" />
            &#60;&nbsp;10min
          </span>
          <span className="mr-3">
            <Badge status="error" />
            &#62;&nbsp;10min
          </span>
          <Switch
            checked={toggle}
            onClick={() => setToggle(!toggle)}
            checkedChildren="Visible"
            unCheckedChildren="Invisible"
          />
        </>
      )}
      height={height}
    >
      <style jsx>
        {
          `
            .activity {
              min-height: 350px;
            }
          `
        }
      </style>
      <ActivityTable toggle={toggle} />
    </BaseComponent>
  );
}

Activity.propTypes = {
  height: PropTypes.number.isRequired,
};

export default Activity;
