import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'antd';

import { mjdToUTCString } from '../../../utility/time';

function AgentListEntry({
  agent,
  node,
  utc,
}) {
  return (
    <tr className="whitespace-no-wrap" key={node+':'+agent}>
      <td>
        {
        utc >= 0 ? <Badge status="success" />
          : <Badge status="error" />
      }
      </td>
      <td className="text-gray-500 pr-2">
        {utc >= 0 ? mjdToUTCString(utc) : mjdToUTCString(-utc)}
      </td>
      <td style={{ color: utc >= 0 ? 'rgba(0, 0, 0, 0.65)' : 'lightgrey' }}>
        {node + ':' + agent}
      </td>
    </tr>
  );
}

AgentListEntry.propTypes = {
  agent: PropTypes.string.isRequired,
  node: PropTypes.string.isRequired,
  utc: PropTypes.number.isRequired,
};

export default AgentListEntry;
