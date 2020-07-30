import React from 'react';
import PropTypes from 'prop-types';

import File from './File';

function Node({
  files,
}) {
  return (
    <>
      <div>
        {
          files.map(({
            txId, name, agent, size, bytes,
          }) => (
            <File
              txId={txId}
              name={name}
              agent={agent}
              size={size}
              bytes={bytes}
            />
          ))
        }
      </div>
    </>
  );
}

Node.propTypes = {
  files: PropTypes.arrayOf(PropTypes.shape({
    txId: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    agent: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
    bytes: PropTypes.number.isRequired,
  })).isRequired,
};

export default Node;
