import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'antd';

/**
 * Menu tab for status name of the tab
 */
function MenuTab({
  name,
  status,
}) {
  return (
    <>
      {
        status != null ? <Badge status={status} />
          : <Badge status="default" />
      }
      {name}
    </>
  );
}

MenuTab.propTypes = {
  name: PropTypes.string.isRequired,
  status: PropTypes.string,
};

MenuTab.defaultProps = {
  status: null,
};

export default MenuTab;
