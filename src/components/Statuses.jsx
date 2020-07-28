import React from 'react';
import dayjs from 'dayjs';
import dayjsPluginUTC from 'dayjs-plugin-utc';

import ActivityTable from './ActivityTable';
import ActivityTime from './ActivityTime';
import ShowTime from './ShowTime';
// import Downtime from './Downtime';

dayjs.extend(dayjsPluginUTC);

function Statuses() {
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
          <td className="pr-2 text-gray-500 ">
            Downtime
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
          <td className="pr-2">
            {/* <Downtime /> */}
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
          <td className="rounded absolute overflow-y-auto activities px-1 pb-1 z-10 transition-all duration-500 ease-in-out">
            <style>
              {`
                .activities {
                  height: 25px;
                }

                .activities:hover {
                  height: 300px;
                  background-color: #fff;
                }
              `}
            </style>
            <ActivityTable />
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default Statuses;
