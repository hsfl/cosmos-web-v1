import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const DropdownMenu = ({
  list, dataKey, callBack, spanText,
}) => {
  const dropdownRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const onClick = () => setIsActive(!isActive);

  useEffect(() => {
    const pageClickEvent = (e) => {
      // toggle active off if active and clicked outside
      if (dropdownRef.current !== null && !dropdownRef.current.contains(e.target)) {
        setIsActive(!isActive);
      }
    };

    // If the item is active then listen for clicks
    if (isActive) {
      window.addEventListener('click', pageClickEvent);
    }

    return () => {
      window.removeEventListener('click', pageClickEvent);
    };
  }, [isActive]);

  /** Call callback function with name */
  const handleClick = (event) => {
    callBack(event.target.name);
  };

  const mapListToListItems = () => {
    if (list !== undefined && dataKey !== undefined) {
      return list.map((li) => (
        <li key={`li_${li[dataKey]}_${dataKey}`}>
          <button name={li[dataKey]} type="button" onClick={handleClick}>{li[dataKey]}</button>
        </li>
      ));
    }
    return (null);
  };

  return (
    <div className="gt-menu-container">
      <button type="button" onClick={onClick} className="gt-menu-trigger">
        <span>{spanText}</span>
      </button>
      <div ref={dropdownRef} className={`gt-menu ${isActive ? 'active' : 'inactive'}`}>
        <ul>
          {
            mapListToListItems()
          }
        </ul>
      </div>
    </div>
  );
};

DropdownMenu.propTypes = {
  list: PropTypes.arrayOf(PropTypes.any).isRequired,
  dataKey: PropTypes.string.isRequired,
  callBack: PropTypes.func.isRequired,
  spanText: PropTypes.string.isRequired,
};

export default DropdownMenu;
