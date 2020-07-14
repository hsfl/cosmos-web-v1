import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Badge, Switch } from 'antd';
import dayjs from 'dayjs';

import BaseComponent from '../BaseComponent';

/**
 * Retrieves data from a web socket. Displays an event along with the timestamp in a table.
 */
function Activity({
  height,
}) {
  /** Get agent list state from the Context */
  const activities = useSelector((s) => s.activity);

  const [color, setColor] = useState('red');
  const [toggle, setToggle] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(null);

  const timerYellow = useRef(null);
  const timerRed = useRef(null);

  // Get lastDate (last retrieved date) and compare with current time)
  // Compare. If <2 min, green, <5min, yellow, < 10min, red

  useEffect(() => {
    if (activities && activities.length !== 0) {
      const minuteDifference = activities[0].time.diff(dayjs(), 'minute');
      if (-minuteDifference <= 2) {
        setElapsedTime(dayjs().diff(activities[0].time, 'second'));
        setColor('green');

        if (timerYellow.current != null && timerRed.current != null) {
          clearTimeout(timerYellow.current);
          clearTimeout(timerRed.current);
        }

        timerYellow.current = setTimeout(() => {
          setColor('orange');
        }, 300000);
        timerRed.current = setTimeout(() => {
          setColor('red');
        }, 600000);
      }
    }
  }, [activities]);

  useEffect(() => {
    if (elapsedTime != null && elapsedTime < 86400) {
      setTimeout(() => setElapsedTime(elapsedTime + 1), 1000);
    } else {
      setElapsedTime(null);
    }
  }, [elapsedTime]);

  return (
    <BaseComponent
      name="Activity"
      liveOnly
      toolsSlot={(
        <>
          <span className="mr-3">
            <Badge status="success" />
            {'< 5 min'}
          </span>
          <span className="mr-3">
            <Badge status="warning" />
            {'< 10 min'}
          </span>
          <span className="mr-3">
            <Badge status="error" />
            {'> 10 min'}
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
      <div className={`bg-${color}-200 transition ease-in duration-500 rounded p-3 activity overflow-auto`}>
        {toggle ? (
          <table>
            <tbody>
              {
              // eslint-disable-next-line camelcase
              activities ? activities.map(({
                status, summary, scope, time,
              }) => (
                // eslint-disable-next-line camelcase
                <tr className="truncate ..." key={summary + time + scope}>
                  <td>
                    <Badge status={status} />
                  </td>
                  <td className="pr-4 text-gray-600">
                    {
                      time.utc().format('HH:mm:ss')
                    }
                  </td>
                  <td>
                    {summary}
                      &nbsp;
                    <span className="text-gray-600">
                      {scope}
                    </span>
                  </td>
                  <td>
                    {
                      dayjs().diff(time, 'day') < 1
                        ? `${dayjs().hour() - time.hour()}:${dayjs().minute() - time.minute()}:${dayjs().second() - time.second()}:`
                        : dayjs().from(time)
                    }
                  </td>
                </tr>
              )) : 'No activity.'
            }
            </tbody>
          </table>
        )
          : (
            <div className="mt-10 text-center text-5xl">
              {
                elapsedTime != null && elapsedTime < 86400
                  ? `${Math.floor(elapsedTime / 3600)}:${Math.floor(elapsedTime / 60)}:${elapsedTime % 60}` : 'Time elapsed >24 hours!'
              }
            </div>
          )}
      </div>
    </BaseComponent>
  );
}

Activity.propTypes = {
  height: PropTypes.number.isRequired,
};

export default Activity;
