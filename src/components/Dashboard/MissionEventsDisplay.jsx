import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import {
  Select, message, Table, Button,
} from 'antd';

import dayjs from 'dayjs';
import BaseComponent from '../BaseComponent';
import { axios } from '../../api';
import { mjdToString } from '../../utility/time';

function MissionEventsDisplay({
  nodes,
  height,
}) {
  /** Retrieve data from the Context */
  const live = useSelector((s) => s.data);

  /** The node whose events is displayed */
  const [node, setNode] = useState(nodes[0]);

  /** The storage of information to be stored in the table */
  const [info, setInfo] = useState([]);

  /** Columns in the table for the MED */
  const [columns] = useState([
    {
      title: 'UTC',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Event Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ]);

  /**
   * Query the database (node:executed) for event logs.
   */
  const queryEventLog = async () => {
    try {
      /** Query database for event logs */
      const { data } = await axios.post(`/query/${process.env.MONGODB_COLLECTION}/${node}:executed`, {
        multiple: true,
        query: {},
      });

      /** Remove the _id from the retrieved logs and modify data to display on table */
      const modify = data.map((el, i) => {
        const newObj = el;
        // eslint-disable-next-line no-underscore-dangle
        delete newObj._id;
        return {
          key: i,
          time: mjdToString(el.event_utc),
          name: el.event_name,
          status: el.event_executc != null ? 'Done.' : 'Pending...',
          log: newObj,
        };
      });
      setInfo(modify);
    } catch {
      message.error(`Error retrieving event logs for ${node}`);
    }
  };

  /** Initialize the mission event log, queries events on the current day */
  useEffect(() => {
    const date = [dayjs().startOf('day'), dayjs().endOf('day')];
    queryEventLog(date);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Update MED with incoming info */
  useEffect(() => {
    if (Object.keys(live).length !== 0) {
      const executed = Object.keys(live).find((item) => item.split(':')[1] === 'executed');
      if (live[executed] != null) {
        const idx = info.findIndex((event) => event.time === live[executed].event_utc);
        info[idx].status = 'Done.';
        info[idx].log = live[executed];
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);

  return (
    <BaseComponent
      name="Mission Events Display"
      height={height}
      toolsSlot={(
        <>
          <Select
            className="pr-2"
            defaultValue={node}
            style={{ width: 120 }}
            onBlur={() => queryEventLog()}
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
          <Button
            type="dashed"
            onClick={() => queryEventLog()}
          >
            Re-query
          </Button>
        </>
      )}
    >
      <Table
        columns={columns}
        dataSource={info}
        expandedRowRender={(record) => <p>{JSON.stringify(record.log)}</p>}
      />
    </BaseComponent>
  );
}

MissionEventsDisplay.propTypes = {
  /** Name of the component to display at the time */
  nodes: PropTypes.arrayOf(PropTypes.string).isRequired,
  height: PropTypes.number.isRequired,
};

export default MissionEventsDisplay;
