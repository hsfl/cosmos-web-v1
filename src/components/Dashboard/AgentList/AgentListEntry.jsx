import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'antd';

import { mjdToString } from '../../../utility/time';

function AgentListEntry({
  agent,
  utc,
}) {
  return (
    <tr key={agent}>
      <td>
        {
        utc >= 0 ? <Badge status="success" />
          : <Badge status="error" />
      }
      </td>
      <td className="text-gray-500 pr-2">
        {utc >= 0 ? mjdToString(utc) : mjdToString(-utc)}
      </td>
      <td style={{ color: utc >= 0 ? 'rgba(0, 0, 0, 0.65)' : 'lightgrey' }}>
        {agent}
      </td>
    </tr>
  );
}

AgentListEntry.propTypes = {
  agent: PropTypes.string.isRequired,
  utc: PropTypes.number.isRequired,
};

export default AgentListEntry;
