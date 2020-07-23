import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DatePicker, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { set } from '../store/actions';

const { RangePicker } = DatePicker;

function GetHistoricalData({
  amountOfComponents,
}) {
  const dispatch = useDispatch();
  const globalQueue = useSelector((s) => s.globalQueue);

  const [globalHistoricalDate, setGlobalHistoricalDate] = useState(null);

  useEffect(() => {
    if (globalQueue === 0) {
      dispatch(set('globalHistoricalDate', null));

      setGlobalHistoricalDate(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalQueue]);

  const getPastHourData = (hour) => {
    dispatch(set('globalQueue', amountOfComponents));
    dispatch(set('globalHistoricalDate', [dayjs().subtract(hour, 'hour'), dayjs()]));
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
      <Button
        disabled={!globalHistoricalDate}
        size="small"
        onClick={() => {
          dispatch(set('globalQueue', amountOfComponents));
          dispatch(set('globalHistoricalDate', globalHistoricalDate));
        }}
      >
        Get Historical Data
      </Button>
      &nbsp;
      <Button
        size="small"
        onClick={() => getPastHourData(1)}
      >
        Past Hour
      </Button>
      &nbsp;
      <Button
        size="small"
        onClick={() => getPastHourData(6)}
      >
        Past 6 Hours
      </Button>
    </>
  );
}

GetHistoricalData.propTypes = {
  amountOfComponents: PropTypes.number.isRequired,
};

export default GetHistoricalData;
