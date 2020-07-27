import React from 'react';
import { useSelector } from 'react-redux';

import ActivityEntry from './Dashboard/Activity/ActivityEntry';

/**
 * Shows the incoming activity from the web socket and displays time elapsed
 * from the last data retrieval.
 */
function ActivityTable() {
  /** Get agent list state from the Context */
  const activities = useSelector((s) => s.activity);

  return (
    <table>
      <tbody>
        {
          activities ? activities.map(({
            status, summary, scope, time,
          }) => (
            <ActivityEntry
              key={status + summary + scope + time}
              status={status}
              summary={summary}
              scope={scope}
              time={time}
            />
          )) : 'No activity.'
        }
      </tbody>
    </table>
  );
}

export default ActivityTable;
