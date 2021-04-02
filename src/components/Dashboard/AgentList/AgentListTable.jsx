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
              agent, node, utc,
            }) => (
              <AgentListEntry agent={agent} node={node} utc={utc} key={node+':'+agent + utc} />
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
