import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'antd';

/**
 * Menu tab for status name of the tab
 */
function MenuTab({
  name,
  layout,
}) {
  return (
    <>
      {
        layout != null ? <Badge status={layout.status} />
          : <Badge status="default" />
      }
      {name}
    </>
  );
}

MenuTab.propTypes = {
  name: PropTypes.string.isRequired,
  layout: PropTypes.objectOf(PropTypes.any),
};

MenuTab.defaultProps = {
  layout: null,
};

export default MenuTab;
