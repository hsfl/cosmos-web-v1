import React from 'react';
import PropTypes from 'prop-types';

import BaseComponent from '../BaseComponent';

/**
 * Image of the component
 */
function Image({
  node,
  name,
  height,
}) {
  return (
    <BaseComponent
      name={name[0].toUpperCase() + name.slice(1, name.length)}
      liveOnly
      height={height}
      showStatus={false}
    >
      <img
        className="mx-auto w-full"
        src={`/${node}/${name}.png`}
        alt={name}
      />
    </BaseComponent>
  );
}

Image.propTypes = {
  node: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  height: PropTypes.number.isRequired,
};

export default Image;
