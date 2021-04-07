import React from 'react';
import PropTypes from 'prop-types';

import BaseComponent from '../BaseComponent';

/**
 * Display an image from public/<node>/<file>
 */
function Image({
  name,
  node,
  file,
}) {
  return (
    <BaseComponent
      name={name}
      liveOnly
      showStatus={false}
    >
      <img
        className="mx-auto w-full"
        src={`/${node}/resources/${file}`}
        alt={file}
      />
    </BaseComponent>
  );
}

Image.propTypes = {
  /** Name of component */
  name: PropTypes.string.isRequired,
  /** Node to pull image from */
  node: PropTypes.string.isRequired,
  /** File name in public/<node> */
  file: PropTypes.string.isRequired,
};

export default Image;
