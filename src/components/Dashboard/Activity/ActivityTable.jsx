import React, {
  useState, useRef, useEffect,
} from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import ActivityTimer from './ActivityTimer';
import ActivityEntry from './ActivityEntry';

/**
 * Shows the incoming activity from the web socket and displays time elapsed
 * from the last data retrieval.
 */
function ActivityTable({
  toggle,
}) {
  /** Get agent list state from the Context */
  const activities = useSelector((s) => s.activity);

  /** Color of the indicator, initial state is red */
  const [color, setColor] = useState('red');

  const [elapsed, setElapsed] = useState(null);

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
  const getDiff = (date, calculated = false) => {
    if (typeof date !== 'string' && dayjs().diff(date, 'day') < 1) {
      if (!calculated) {
        const hour = dayjs().diff(date, 'hour');
        const minute = dayjs().diff(date, 'minute') % 60;
        const second = dayjs().diff(date, 'second') % 60;
        return dayjs().set('hour', hour).set('minute', minute).set('second', second);
      }
      return date.add(1, 'second');
    }

    return 'Over a day ago';
  };

  /**
   * Store the incoming activity in data with the elapsed field and calculate the difference.
   * Start the timers for the indicator color change.
   */
  useEffect(() => {
    if (activities && activities.length !== 0) {
      setElapsed(getDiff(activities[0].time));

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
    /** Set the 1 second timer */
    timer.current = setTimeout(() => {
      setElapsed(getDiff(elapsed, true));
    }, 1000);

    /** Clear timer on unmount */
    return () => clearTimeout(timer.current);
  }, [elapsed]);

  return (
    <div className={`bg-${color}-200 transition ease-in duration-500 rounded p-3 activity overflow-auto`}>
      <div className="text-center text-2xl">
        <ActivityTimer elapsed={elapsed} />
      </div>
      {
        toggle ? (
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
        )
          : null
      }
    </div>
  );
}

ActivityTable.propTypes = {
  toggle: PropTypes.bool.isRequired,
};

export default ActivityTable;
