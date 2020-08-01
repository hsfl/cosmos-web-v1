import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';
import BaseComponent from '../BaseComponent';
import PanelList from './Replacement/PanelList';

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

Replacement.propTypes = {
  height: PropTypes.number.isRequired,
};

export default Replacement;
