import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import dayjsPluginUTC from 'dayjs-plugin-utc';

dayjs.extend(dayjsPluginUTC);

function Clock() {
  /** Storage for local time */
  const [time, setTime] = useState(dayjs());
  /** Storage for utc time */
  const [utcTime, setUtcTime] = useState(dayjs().utc());

  /** On mount, set the time and update each second */
  useEffect(() => {
    // Every second, update local and UTC time view
    const clock = setTimeout(() => {
      setTime(dayjs());
      setUtcTime(dayjs.utc());
    }, 1000);

    // Stop timeout on unmount
    return () => {
      clearTimeout(clock);
    };
  }, [time, utcTime]);

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
        </tr>
        <tr>
          <td className="pr-4">
            {time.format('YYYY-MM-DD')}
          </td>
          <td className="pr-2">
            {utcTime.format('YYYY-MM-DD')}
          </td>
        </tr>
        <tr>
          <td className="pr-4">
            {time.format('HH:mm:ss')}
          </td>
          <td className="pr-2">
            {utcTime.format('HH:mm:ss')}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default Clock;
