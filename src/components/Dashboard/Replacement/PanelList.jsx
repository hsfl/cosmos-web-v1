import React from 'react';
import PropTypes from 'prop-types';

import { Collapse } from 'antd';
import Node from './Node';

const { Panel } = Collapse;
/**
 * Retrieves the agent list and displays it in a table.
 * Also displays the timestamp of the agent's last heartbeat.
 */
function PanelList({
  list,
  fileType,
}) {
  return (
    <>
      <strong>{fileType.charAt(0).toUpperCase() + fileType.slice(1)}</strong>
      <Collapse>
        {
          list[fileType] ? Object.entries(list[fileType]).map(([node, files]) => (
            <Panel
              key={node}
              header={node}
            >
              <Node
                files={files}
                key={node}
              />
            </Panel>
          )) : null
        }
      </Collapse>
    </>
  );
}

PanelList.propTypes = {
  list: PropTypes.shape.isRequired,
  fileType: PropTypes.string.isRequired,
};

export default PanelList;
