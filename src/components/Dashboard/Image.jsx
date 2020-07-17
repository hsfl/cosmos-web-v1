import React from 'react';
import PropTypes from 'prop-types';

import BaseComponent from '../BaseComponent';

/**
 * Image of the component
 */
function Image({
  node,
  name,
  file,
  height,
}) {
  return (
    <BaseComponent
      name={name}
      liveOnly
      height={height}
      showStatus={false}
    >
      <img
        className="mx-auto w-full"
        src={`/${node}/${file}`}
        alt={file}
      />
    </BaseComponent>
  );
}

Image.propTypes = {
  node: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  file: PropTypes.string.isRequired,
  height: PropTypes.number.isRequired,
};

export default Image;
