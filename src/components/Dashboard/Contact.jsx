import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Select } from 'antd';
import dayjs from 'dayjs';
import BaseComponent from '../BaseComponent';
import { dateToMJD } from '../../utility/time';

function Contact({
  nodes,
  height,
}) {
  const realTime = useSelector((s) => s.data);
  const test = useSelector((s) => s);

  const [red, setRed] = useState(255);
  const [green, setGreen] = useState(0);
  const [lastDate, setLastDate] = useState(dateToMJD(dayjs()));
  const [node, setNode] = useState(nodes[0]);

  const checkNode = () => {
    const exists = Object.keys(realTime).find((item) => item.split(':')[0] === node);
    if (exists && realTime[exists].node_utc > lastDate) {
      setRed(0);
      setGreen(255);
      setLastDate(realTime[exists].node_utc);
    } else {
      setRed(255);
      setGreen(0);
    }
  };

  useEffect(() => {
    const exists = Object.keys(realTime).find((item) => item.split(':')[0] === node);
    if (exists && realTime[exists].node_utc > lastDate) {
      setRed(0);
      setGreen(255);
      setLastDate(realTime[exists].node_utc);
    } else if (red <= 255) {
      const yellow = setInterval(() => setRed(red + (255 / 300)), 5000);
      if (exists) {
        clearInterval(yellow);
      }
    } else {
      const redding = setInterval(() => setGreen(green - (255 / 3)), 5000);
      if (exists) {
        clearInterval(redding);
      }
    }
  }, [realTime]);

  return (
    <BaseComponent
      name="Contact"
      height={height}
      toolsSlot={(
        <>
          <Select
            defaultValue={node}
            style={{ width: 120 }}
            onBlur={() => checkNode()}
            onChange={(val) => setNode(val)}
          >
            {
              nodes.map((el) => (
                <Select.Option
                  key={el}
                >
                  {el}
                </Select.Option>
              ))
            }
          </Select>
        </>
      )}
    >
      {console.log(realTime, test, lastDate)}
      <div
        className="w-full rounded"
        style={{ backgroundColor: `rgb(${red},${green}, 0)`, height: height / 2 }}
      >
        &nbsp;
      </div>
    </BaseComponent>
  );
}

Contact.propTypes = {
  /** Name of the component to display at the time */
  nodes: PropTypes.arrayOf(PropTypes.string).isRequired,
  height: PropTypes.number.isRequired,
};

export default Contact;
