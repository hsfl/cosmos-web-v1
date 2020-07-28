import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'antd';

function File({
  txId, name, agent, size, bytes,
}) {
  return (
    <tr key={txId + name + agent + size}>
      <td>
        <Badge status={bytes / size < 1 ? 'processing' : 'success'} />
      </td>
      <td className="text-gray-500 pr-1">
        {
          Math.round((bytes / size) * 100)
        }
        %
      </td>
      <td>
        {name}
      </td>
    </tr>
  );
}

File.propTypes = {
  txId: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  agent: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  bytes: PropTypes.number.isRequired,
};

export default File;
