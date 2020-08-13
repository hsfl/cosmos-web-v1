import React from 'react';
import PropTypes from 'prop-types';

import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';

function PercentDifference({
  percentDifference,
}) {
  if (percentDifference && percentDifference > 0) {
    return (
      <strong className="text-green-500">
        <ArrowUpOutlined />
        {
          percentDifference.toFixed(2)
        }
        %
      </strong>
    );
  // eslint-disable-next-line no-else-return
  } else if (percentDifference && percentDifference < 0) {
    return (
      <strong className="text-red-500">
        <ArrowDownOutlined />
        {
          Math.abs(percentDifference.toFixed(2))
        }
        %
      </strong>
    );
  }
  return (
    <strong>
      <MinusOutlined />
      0.00%
    </strong>
  );
}

PercentDifference.propTypes = {
  percentDifference: PropTypes.string,
};

PercentDifference.defaultProps = {
  percentDifference: null,
};

export default PercentDifference;
