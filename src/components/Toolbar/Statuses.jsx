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
import { COSMOSAPI } from '../../api';

dayjs.extend(dayjsPluginUTC);

function Statuses({
  nodes,
}) {
  const dispatch = useDispatch();

  /** Query database on page load */
  useEffect(() => {
    const initializeQuery = async () => {
      try {
        // todo: check if nodes exists, and also if other nodes might be active if nodes[0] is not
        COSMOSAPI.queryCurrentSOHData(nodes[0], {
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
        }, (data) => {
          // Send information to redux
          dispatch(set('lastActivity', data));
        });
      } catch (err) {
        message.error('Error initializing page.');
      }
    };

    initializeQuery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);

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
            <Downtime />
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

Statuses.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Statuses;
