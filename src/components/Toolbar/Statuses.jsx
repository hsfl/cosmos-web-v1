import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import dayjsPluginUTC from 'dayjs-plugin-utc';
import { message } from 'antd';

import { useDispatch } from 'react-redux';

import { set } from '../../store/actions';
import ActivityTable from './ActivityTable';
import ActivityTime from './ActivityTime';
import ShowTime from './ShowTime';
import Downtime from './Downtime';
import { axios } from '../../api';

dayjs.extend(dayjsPluginUTC);

function Statuses({
  realm,
}) {
  const dispatch = useDispatch();

  /** Query database on page load */
  useEffect(() => {
    const initializeQuery = async () => {
      try {
        const { data } = await axios.post(`query/${realm}/any`, {
          query: {},
          options: {
            projection: {
              node_utc: 1,
              node_downtime: 1,
            },
            sort: {
              node_utc: -1,
            },
          },
        });

        // Send information to redux
        dispatch(set('lastActivity', data));
      } catch (err) {
        message.error('Error initializing page.');
      }
    };

    initializeQuery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realm]);

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
            Last Activity
          </td>
          <td className="pr-2 text-gray-500 ">
            Downtime Counter
          </td>
        </tr>
        <tr>
          <td className="pr-4 text-black">
            <ShowTime
              utc={false}
              format="YYYY-MM-DD"
            />
          </td>
          <td className="pr-2 text-black">
            <ShowTime
              utc
              format="YYYY-MM-DD"
            />
          </td>
          <td className="pr-2 text-black">
            <ActivityTime />
          </td>
          <td className="pr-2 text-black">
            <Downtime />
          </td>
        </tr>
        <tr>
          <td className="pr-4 text-black">
            <ShowTime
              utc={false}
              format="HH:mm:ss"
            />
          </td>
          <td className="pr-2 text-black">
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

Statuses.propTypes = {
  realm: PropTypes.string.isRequired,
};

export default Statuses;
