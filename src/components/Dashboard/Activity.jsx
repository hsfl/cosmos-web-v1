import React from 'react';
import { Badge } from 'antd';
import ActivityTable from './Activity/ActivityTable';
import BaseComponent from '../BaseComponent';

/**
 * Shows the incoming activity from the web socket and displays time elapsed
 * from the last data retrieval.
 */
function Activity() {
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
        </>
      )}
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
      <ActivityTable />
    </BaseComponent>
  );
}

export default Activity;
