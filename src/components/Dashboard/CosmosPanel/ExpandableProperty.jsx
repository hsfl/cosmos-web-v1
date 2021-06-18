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
  }

  return (
    <>
      <div
        role="button"
        onClick={() => handleClick()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {title}
        {isOpen ? '-' : '+'}
        <span className={`typeofnamespan ${isHovered ? 'isHovered' : ''}`}>{ type }</span>
      </div>
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
}

export default React.memo(ExpandableProperty);
