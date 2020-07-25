import React from 'react';
import dayjs from 'dayjs';
import dayjsPluginUTC from 'dayjs-plugin-utc';

import ActivityTable from './ActivityTable';
import ActivityTime from './ActivityTime';
import ShowTime from './ShowTime';

dayjs.extend(dayjsPluginUTC);

function Clock() {
  return (
    <table>
      <tbody>
        <tr>
          <td className="pr-4 text-gray-500">
            {`Local (UTC ${dayjs().format('Z')})`}
          </td>
          <td className="pr-2 text-gray-500 ">
            UTC
          </td>
          <td className="pr-2 text-gray-500 ">
            Activity
          </td>
        </tr>
        <tr>
          <td className="pr-4">
            <ShowTime
              utc={false}
              format="YYYY-MM-DD"
            />
          </td>
          <td className="pr-2">
            <ShowTime
              utc
              format="YYYY-MM-DD"
            />
          </td>
          <td className="pr-2">
            <ActivityTime />
          </td>
        </tr>
        <tr>
          <td className="pr-4">
            <ShowTime
              utc={false}
              format="HH:mm:ss"
            />
          </td>
          <td className="pr-2">
            <ShowTime
              utc
              format="HH:mm:ss"
            />
          </td>
          <ActivityTable />
        </tr>
      </tbody>
    </table>
  );
}

export default Clock;
