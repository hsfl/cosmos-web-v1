import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DatePicker, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

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
  }, [globalQueue]);

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
    </>
  );
}

GetHistoricalData.propTypes = {
  amountOfComponents: PropTypes.number.isRequired,
};

export default GetHistoricalData;
