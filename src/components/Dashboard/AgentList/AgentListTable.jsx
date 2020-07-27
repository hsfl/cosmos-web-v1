import React from 'react';
import PropTypes from 'prop-types';

import AgentListEntry from './AgentListEntry';

function AgentListTable({
  list,
}) {
  return (
    <>
      {
        !list || list.length === 0 ? 'No agents.' : null
      }
      <table>
        <tbody>
          {
            list ? list.map(({
              agent, utc,
            }) => (
              <AgentListEntry agent={agent} utc={utc} key={agent + utc} />
            )) : null
          }
        </tbody>
      </table>
    </>
  );
}

AgentListTable.propTypes = {
  list: PropTypes.arrayOf(PropTypes.shape).isRequired,
};

export default AgentListTable;
