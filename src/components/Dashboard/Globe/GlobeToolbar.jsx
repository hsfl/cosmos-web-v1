import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Cesium from 'cesium';
import { useCesium } from 'resium';

const DropdownMenu = ({ list, dataKey, callBack }) => {
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
        <li key={`li_${li[dataKey]}`}>
          <button name={li[dataKey]} type="button" onClick={handleClick}>{li[dataKey]}</button>
        </li>
      ));
    }
    return (null);
  };

  return (
    <div className="gt-menu-container">
      <button type="button" onClick={onClick} className="gt-menu-trigger">
        <span>Sat</span>
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
};

const GlobeToolbar = ({
  orbitsState,
}) => {
  const list = useSelector((s) => s.list.agent_list);

  const [trackNode, setTrackNode] = useState('');

  const { viewer } = useCesium();

  useEffect(() => {
    if (trackNode && trackNode !== '') {
      const pos = orbitsState.find((orbit) => orbit.name === trackNode).posGeod;
      pos.height += 100000;
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromRadians(pos.longitude, pos.latitude, pos.height),
      });
    }
  }, [trackNode, orbitsState, viewer]);

  /** Track selected node with camera */
  const handleNodeDropDownClick = (nodeName) => {
    setTrackNode(nodeName);
  };

  return (
    <div className="globetoolbar-container">
      <DropdownMenu list={list !== undefined ? list : []} dataKey="node" callBack={handleNodeDropDownClick} />
    </div>
  );
};

GlobeToolbar.propTypes = {
  orbitsState: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default GlobeToolbar;
