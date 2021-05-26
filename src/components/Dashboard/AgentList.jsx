import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Switch } from 'antd';
import compare from '../../utility/sort';

import BaseComponent from '../BaseComponent';
import AgentListTable from './AgentList/AgentListTable';

/**
 * Retrieves the agent list and displays it in a table.
 * Also displays the timestamp of the agent's last heartbeat.
 */
function AgentList({
  node,
}) {
  /** Get agent list state from the Context */
  const list = useSelector((s) => s.list.agent_list);

  /** Store the list in an array */
  const [agentList, setAgentList] = useState([]);

  /** Choose to display only active agents or not */
  const [active, setActive] = useState(false);

  /** Update the agent list upon node change or incoming list change */
  useEffect(() => {
    setAgentList([]);

    /** If there is a specified node, filter out those agents */
    if (node !== '' && list != null) {
      const filtered = list.filter((item) => item.agent.split(':')[0] === node);
      setAgentList(filtered.sort(compare));
    } else if (list != null) {
      /** Otherwise, show all agents */
      setAgentList([...list].sort(compare));
    }
  }, [list, node]);

  return (
    <BaseComponent
      name="Agent List"
      movable
      toolsSlot={(
        <>
          <Switch
            checkedChildren="Active"
            unCheckedChildren="All"
            onClick={() => setActive(!active)}
          />
        </>
      )}
    >
      <AgentListTable
        list={active ? agentList.filter((agent) => agent.utc >= 0) || []
          : agentList || []}
        node={node}
      />
    </BaseComponent>
  );
}

AgentList.propTypes = {
  /** Name of the node to display. If empty string, display all */
  node: PropTypes.string,
};

AgentList.defaultProps = {
  node: '',
};

export default AgentList;
