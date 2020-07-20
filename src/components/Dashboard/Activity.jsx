import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Badge, Switch } from 'antd';
import dayjs from 'dayjs';
import ActivityTable from './Activity/ActivityTable';
import BaseComponent from '../BaseComponent';

/**
 * Shows the incoming activity from the web socket and displays time elapsed
 * from the last data retrieval.
 */
function Activity({
  height,
}) {
  /** Get agent list state from the Context */
  const activities = useSelector((s) => s.activity);

  /** Color of the indicator, initial state is red */
  const [color, setColor] = useState('red');

  /** Keeps track of whether to show all agents (active & inactive) or just active ones */
  const [toggle, setToggle] = useState(true);

  /** The modified information coming in from the state activities, includes time elapsed */
  const [data, setData] = useState([]);

  /** Reference to the timer that changes the indicator to yellow */
  const timerYellow = useRef(null);

  /** Reference to the timer that changes the indicator to red */
  const timerRed = useRef(null);

  /** Reference to the timer that increments all elapsed times after 1 second */
  const timer = useRef(null);

  /**
   * Calculate the difference between the current time and the date provided, returning
   * the difference as a dayjs object. If the difference is over a day, then a string is returned.
   * @param {dayjs object} date
   */
  const getDiff = (date) => {
    if (typeof date !== 'string' && dayjs().diff(date, 'day') < 1) {
      const hour = dayjs().diff(date, 'hour');
      const minute = dayjs().diff(date, 'minute') % 60;
      const second = dayjs().diff(date, 'second') % 60;
      return dayjs().set('hour', hour).set('minute', minute).set('second', second);
    }

    return 'Over a day ago';
  };

  /**
   * Store the incoming activity in data with the elapsed field and calculate the difference.
   * Start the timers for the indicator color change.
   */
  useEffect(() => {
    if (activities && activities.length !== 0) {
      /** Store incoming activity in a new array with the elapsed field */
      setData((d) => [
        {
          status: activities[0].status,
          summary: activities[0].summary,
          scope: activities[0].scope,
          time: activities[0].time,
          elapsed: getDiff(activities[0].time),
        },
        ...d,
      ]);

      /** Calculate difference in times */
      const minuteDifference = activities[0].time.diff(dayjs(), 'minute');
      if (-minuteDifference <= 2) {
        /** Reset 1 second timer */
        if (timer.current != null) {
          clearTimeout(timer.current);
        }

        setColor('green');

        /** Reset timers */
        if (timerYellow.current != null && timerRed.current != null) {
          clearTimeout(timerYellow.current);
          clearTimeout(timerRed.current);
        }

        /** Start timers */
        timerYellow.current = setTimeout(() => {
          setColor('orange');
        }, 300000);
        timerRed.current = setTimeout(() => {
          setColor('red');
        }, 600000);
      }
    }
  }, [activities]);

  /** Increments the timers for all data points */
  useEffect(() => {
    if (data && data.length !== 0) {
      /** Set the 1 second timer */
      timer.current = setTimeout(() => {
        data[0].elapsed = getDiff(data[0].elapsed);
      }, 1000);
    }

    /** Clear timer on unmount */
    return () => clearTimeout(timer.current);
  }, [data]);

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
      <div className={`bg-${color}-200 transition ease-in duration-500 rounded p-3 activity overflow-auto`}>
        <ActivityTable data={data} toggle={toggle} />
      </div>
    </BaseComponent>
  );
}

Activity.propTypes = {
  height: PropTypes.number.isRequired,
};

export default Activity;
