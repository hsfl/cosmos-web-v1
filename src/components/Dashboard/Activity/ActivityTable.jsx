import React from 'react';
import PropTypes from 'prop-types';

import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import ActivityTimer from './ActivityTimer';

/**
 * Shows the incoming activity from the web socket and displays time elapsed
 * from the last data retrieval.
 */
function ActivityTable({
  data,
  toggle,
}) {
  return (
    <>
      {toggle ? (
        <>
          <div className="text-center text-2xl">
            <ActivityTimer data={data} />
          </div>
          <table>
            <tbody>
              {
                data ? data.map(({
                  status, summary, scope, time,
                }) => (
                  <tr className="truncate ..." key={summary + time + scope + status}>
                    <td>
                      {
                        status === 'success' ? <CheckCircleTwoTone twoToneColor="#52c41a" /> : <CloseCircleTwoTone twoToneColor="#d80000" />
                      }
                      &nbsp;
                    </td>
                    <td className="pr-2 text-gray-600">
                      {
                        time.utc().format('HH:mm:ss')
                      }
                    </td>
                    <td className="pr-2">
                      { summary }
                      &nbsp;
                      <span className="text-gray-600">
                        { scope }
                      </span>
                    </td>
                  </tr>
                )) : 'No activity.'
              }
            </tbody>
          </table>
        </>
      )
        : (
          <div className="mt-10 text-center text-5xl">
            <ActivityTimer data={data} />
          </div>
        )}
    </>
  );
}

ActivityTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape).isRequired,
  toggle: PropTypes.bool.isRequired,
};

export default ActivityTable;
