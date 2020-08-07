import React from 'react';

import { useSelector } from 'react-redux';
import BaseComponent from '../BaseComponent';
import PanelList from './Replacement/PanelList';

/**
 * Retrieves the agent list and displays it in a table.
 * Also displays the timestamp of the agent's last heartbeat.
 */
function Replacement() {
  /** Get agent list state from the Context */
  const list = useSelector((s) => s.file_list);

  return (
    <BaseComponent
      name="Replacement"
      movable
    >
      {
        !list
          ? 'No files.' : (
            <>
              <PanelList list={list} fileType="outgoing" />
              <PanelList list={list} fileType="incoming" />
            </>
          )
      }
    </BaseComponent>
  );
}

export default Replacement;
