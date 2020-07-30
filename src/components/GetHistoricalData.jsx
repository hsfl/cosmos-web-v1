import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DatePicker, Button, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { set, resetQueue } from '../store/actions';
import { axios } from '../api';
import { dateToMJD } from '../utility/time';

const { RangePicker } = DatePicker;

function GetHistoricalData({
  tab,
  amountOfComponents,
}) {
  const dispatch = useDispatch();
  const realm = useSelector((s) => s.realm);
  const keys = useSelector((s) => s.keys[tab]);
  const retrievedQuery = useSelector((s) => s.retrievedQuery);

  const [globalHistoricalDate, setGlobalHistoricalDate] = useState(null);

  useEffect(() => {
    if (retrievedQuery === amountOfComponents) {
      dispatch(resetQueue());
      dispatch(set('globalHistoricalDate', null));
      dispatch(set('queriedData', null));

      setGlobalHistoricalDate(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retrievedQuery]);

  const queryData = async (from, to) => {
    message.loading('Retrieving past data...', null);

    dispatch(set('retrievedQuery', 0));

    const query = [];
    const projection = {};
    const sort = {};

    if (keys && keys.dataKeys) {
      Object.entries(keys.dataKeys).forEach(([key, entry]) => {
        query.push({
          [entry.timeDataKey]: {
            $gt: dateToMJD(from),
            $lt: dateToMJD(to),
          },
        });

        projection[entry.timeDataKey] = 1;
        projection[key] = 1;

        sort[entry.timeDataKey] = 1;
      });

      try {
        const { data } = await axios.post(`/query/${realm}/any`, {
          multiple: true,
          query: {
            $or: query,
          },
          options: {
            projection,
            sort,
          },
        });

        dispatch(set('queriedData', data));
      } catch (error) {
        message.destroy();
        message.error(error.message);
      }

      message.destroy();
      message.success('Done retrieving data.');
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
          onClick={() => queryData(dayjs().subtract(1, 'hour'), dayjs())}
        >
          Past Hour
        </Button>
        &nbsp;
        <Button
          size="small"
          onClick={() => queryData(dayjs().subtract(6, 'hour'), dayjs())}
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
};

export default GetHistoricalData;
