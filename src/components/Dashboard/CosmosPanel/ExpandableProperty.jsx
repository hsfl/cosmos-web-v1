import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ExpandableProperty = ({
  title, expanded, type, children,
}) => {
  const [isOpen, setIsOpen] = useState(expanded);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsOpen(isOpen => !isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {title}
        {isOpen ? '-' : '+'}
        <span className={`typeofnamespan ${isHovered ? 'isHovered' : ''}`} >{ type }</span>
      </div>
      {isOpen ? children : null}
    </>
  );
};

ExpandableProperty.propTypes = {
  title: PropTypes.string.isRequired,
  expanded: PropTypes.bool.isRequired,
  type: PropTypes.string,
}

export default React.memo(ExpandableProperty);
