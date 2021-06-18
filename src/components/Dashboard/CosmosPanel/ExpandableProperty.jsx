import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ExpandableProperty = ({
  title, expanded, type, name, callBack, children,
}) => {
  const [isOpen, setIsOpen] = useState(expanded);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    callBack(name);
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => handleClick()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {title}
        {isOpen ? '-' : '+'}
        <span className={`typeofnamespan ${isHovered ? 'isHovered' : ''}`}>{ type }</span>
      </button>
      {isOpen ? children : null}
    </>
  );
};

ExpandableProperty.propTypes = {
  title: PropTypes.string.isRequired,
  expanded: PropTypes.bool.isRequired,
  name: PropTypes.string,
  type: PropTypes.string,
  callBack: PropTypes.func.isRequired,
  children: PropTypes.node,
};

ExpandableProperty.defaultProps = {
  name: undefined,
  type: undefined,
  children: undefined,
};

export default React.memo(ExpandableProperty);
