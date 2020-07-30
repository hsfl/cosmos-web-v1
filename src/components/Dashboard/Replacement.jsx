import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';
// import moment from 'moment-timezone';

import { Collapse } from 'antd';
import BaseComponent from '../BaseComponent';
import Node from './Replacement/Node';

const { Panel } = Collapse;
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
        Object.keys(list.outgoing).length === 0
        && Object.keys(list.incoming).length === 0
          ? 'No files.' : (
            <Collapse>
              <strong className="pl-2">Outgoing:</strong>
              {
                list ? Object.entries(list.outgoing).map(([node, files]) => (
                  <Panel
                    header={node}
                  >
                    <Node
                      files={files}
                      key={node}
                    />
                  </Panel>
                )) : null
              }
              <strong className="pl-2">Incoming:</strong>
              {
                list ? Object.entries(list.incoming).map(([node, files]) => (
                  <Panel
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
          )
      }
    </BaseComponent>
  );
}

Replacement.propTypes = {
  height: PropTypes.number.isRequired,
};

export default Replacement;
