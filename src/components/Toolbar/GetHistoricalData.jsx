import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DatePicker, Button, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { set, resetQueue } from '../../store/actions';
import { COSMOSAPI } from '../../api';
import { dateToMJD } from '../../utility/time';

const { RangePicker } = DatePicker;

function GetHistoricalData({
  tab,
  amountOfComponents,
  nodes,
}) {
  const dispatch = useDispatch();
  // const realm = useSelector((s) => s.realm);
  const keys = useSelector((s) => s.keys[tab]);
  const retrievedQuery = useSelector((s) => s.retrievedQuery);

  const [globalHistoricalDate, setGlobalHistoricalDate] = useState(null);

  useEffect(() => {
    if (retrievedQuery === amountOfComponents) {
      dispatch(resetQueue());
      dispatch(set('globalHistoricalDate', null));
      dispatch(set('queriedData', null));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retrievedQuery]);

  /** Global query data for current tab view */
  const queryData = async (from, to) => {
    message.loading('Retrieving past data...', null);

    // Initialize query queue
    dispatch(set('retrievedQuery', 0));

    const query = [];
    const projection = {};
    const nodeDowntime = {}; // in case node_downtime/node_utc aren't added

    // Generate mongodb query based on keys
    if (keys && keys.dataKeys) {
      Object.entries(keys.dataKeys).forEach(([key, entry]) => {
        if (entry.timeDataKey) {
          query.push({
            [entry.timeDataKey]: {
              $gt: dateToMJD(from),
              $lt: dateToMJD(to),
            },
          });
          projection[entry.timeDataKey] = 1;
          projection[key] = 1;
        }
      });
      projection['node_name'] = 1;
      projection['agent_name'] = 1;

      const ingestQuery = (data) => {
        try {
          if (data.error) {
            throw new Error(data.error);
          }
          // Coerce data into array according to retrieved data
          const fields = {};
          if (data.length !== 0) {
            // Go through data keys and sort based on time
            Object.entries({
              ...keys.dataKeys,
              ...nodeDowntime,
            }).forEach(([key, { timeDataKey }]) => {
              // Filter out corresponding data key and time data key, insert into x,y object to sort
              const unsorted = data.reduce((filter, entry) => {
                if (key in entry && timeDataKey in entry && entry[key] && entry[timeDataKey]) {
                  filter.push({
                    x: entry[timeDataKey],
                    y: entry[key],
                  });
                }
                return filter;
              }, []);

              // Sort based on date
              const sorted = unsorted.sort((a, b) => a.x - b.x);

              // Store values in array according to key in an object
              fields[timeDataKey] = [];
              fields[key] = [];

              sorted.forEach((entry) => {
                fields[timeDataKey].push(entry.x);
                fields[key].push(entry.y);
              });
            });

            message.destroy();
            message.success('Done retrieving data.');
          } else {
            message.destroy();
            message.warning(`No data between ${from.format('YYYY-MM-DD HH:mm:ss')} - ${to.format('YYYY-MM-DD HH:mm:ss')}`, 10);
          }

          dispatch(set('queriedData', fields));
          dispatch(set('xMin', from.format('YYYY-MM-DDTHH:mm:ss')));
          dispatch(set('xMax', to.format('YYYY-MM-DDTHH:mm:ss')));
        } catch (error) {
          message.destroy();
          message.error(error.message);
        }
      };

      nodes.forEach((node) => {
        COSMOSAPI.querySOHData(node, {
          query: {
            $or: query,
          },
          options: {
            projection,
          },
          beginDate: dateToMJD(from),
          endDate: dateToMJD(to),
        }, ingestQuery);
      });
    }
  };

  return (
    <>
      <RangePicker
        className="mr-3"
        showTime
        format="YYYY-MM-DD HH:mm:ss"
        onChange={(m) => setGlobalHistoricalDate(m)}
        value={globalHistoricalDate}
        size="small"
      />
      <div className="pt-1">
        <Button
          disabled={!globalHistoricalDate}
          size="small"
          onClick={() => queryData(globalHistoricalDate[0], globalHistoricalDate[1])}
        >
          Get Past Data
        </Button>
        &nbsp;
        <Button
          size="small"
          onClick={() => queryData(dayjs().subtract(1, 'hour').utc(), dayjs().utc())}
        >
          Past Hour
        </Button>
        &nbsp;
        <Button
          size="small"
          onClick={() => queryData(dayjs().subtract(6, 'hour').utc(), dayjs().utc())}
        >
          Past 6 Hours
        </Button>
      </div>
    </>
  );
}

GetHistoricalData.propTypes = {
  tab: PropTypes.string.isRequired,
  amountOfComponents: PropTypes.number.isRequired,
  nodes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default GetHistoricalData;
