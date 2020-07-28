import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';
// import moment from 'moment-timezone';

import BaseComponent from '../BaseComponent';
import Node from './Replacement/Node';

/**
 * Retrieves the agent list and displays it in a table.
 * Also displays the timestamp of the agent's last heartbeat.
 */
function Replacement({
  height,
}) {
  /** Get agent list state from the Context */
  const list = useSelector((s) => s.file_list);

  return (
    <BaseComponent
      name="Replacement"
      movable
      height={height}
    >
      {
        Object.keys(list).length === 0 ? 'No files.' : null
      }
      <table>
        <tbody>
          {
            list && list.outgoing ? Object.entries(list.outgoing).map(([node, files]) => (
              <Node
                node={node}
                files={files}
                key={node}
              />
            )) : null
          }
        </tbody>
      </table>
    </BaseComponent>
  );
}

Replacement.propTypes = {
  height: PropTypes.number.isRequired,
};

export default Replacement;
