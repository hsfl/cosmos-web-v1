import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircleTwoTone, ExclamationCircleTwoTone } from '@ant-design/icons';

function ActivityEntry({
  status,
  summary,
  scope,
  time,
}) {
  return (
    <tr className="truncate ...">
      <td>
        {
          status === 'success' ? <CheckCircleTwoTone twoToneColor="#52c41a" /> : <ExclamationCircleTwoTone twoToneColor="#bc6b1a" />
        }
        &nbsp;
      </td>
      <td className="pr-2 text-gray-600">
        {
          time.utc().format('HH:mm:ss')
        }
      </td>
      <td className="pr-2">
        { summary }
        &nbsp;
        <span className="text-gray-600">
          { scope }
        </span>
      </td>
    </tr>
  );
}

ActivityEntry.propTypes = {
  status: PropTypes.string.isRequired,
  summary: PropTypes.string.isRequired,
  scope: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
};

export default ActivityEntry;
