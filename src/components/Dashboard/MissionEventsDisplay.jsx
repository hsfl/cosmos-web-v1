import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import {
  Select, message, Table, Button,
} from 'antd';

import dayjs from 'dayjs';
import BaseComponent from '../BaseComponent';
import { axios } from '../../api';
import { mjdToUTCString } from '../../utility/time';
import parseEscapedChar from '../../utility/string';

/**
 * Display previously queued and/or executed commands by agent exec in a table.
 * Shows the create date, execute date, event details, and output.
 */
function MissionEventsDisplay({
  nodes,
}) {
  /** Retrieve data from the Context */
  const live = useSelector((s) => s.data);
  const realm = useSelector((s) => s.realm);
  const queue = useSelector((s) => s.event_queue);

  /** The node whose events is displayed */
  const [node, setNode] = useState(nodes[0]);

  /** The storage of information to be stored in the table */
  const [info, setInfo] = useState([]);

  /** Event queue state */
  const [queueState, setQueueState] = useState([]);

  /** Columns in the table for the MED */
  const [columns] = useState([
    {
      title: 'Event Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Sent',
      dataIndex: 'sent',
      key: 'sent',
    },
    {
      title: 'Executed',
      dataIndex: 'exec',
      key: 'exec',
    },
  ]);

  const [queueColumns] = useState([
    {
      title: 'Event Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Executed',
      dataIndex: 'exec',
      key: 'exec',
    },
    {
      title: 'Condition',
      dataIndex: 'condition',
      key: 'condition',
    },
  ]);

  /**
   * Query the database (node:executed) for event logs.
   */
  const queryEventLog = async () => {
    try {
      /** Query database for event logs */
      const { data } = await axios.post(`/query/${realm}/${node}:executed`, {
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
          sent: mjdToUTCString(el.event_utc),
          name: el.event_name,
          exec: el.event_utcexec != null ? mjdToUTCString(el.event_utcexec) : 'Pending...',
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
        const idx = info.findIndex((event) => event.sent === live[executed].event_utc);
        info[idx].exec = live[executed].utcexec;
        info[idx].log = live[executed];
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);

  useEffect(() => {
    if (queue && Object.keys(queue).length !== 0) {
      setQueueState(queue.map((event) => ({
        name: event.event_name,
        exec: event.event_utcexec,
        condition: event.event_condition,
        log: event,
      })));
    }
  }, [queue]);

  return (
    <BaseComponent
      name="Mission Events Display"
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
      <table className="w-full">
        <tbody>
          <tr>
            <td className="w-1/2">
              <strong>Executed Events</strong>
              <Table
                columns={columns}
                dataSource={info}
                expandedRowRender={(record) => (
                  <table>
                    <tbody>
                      <tr className="align-top w-full pr-4">
                        <td className="w-1/2">
                          {
                            Object.keys(record.log).map((key) => (
                              <tr>
                                <td>
                                  {`${key}:`}
                                </td>
                                <td>
                                  {record.log[key]}
                                </td>
                              </tr>
                            ))
                          }
                        </td>
                        <td className="w-1/2 border-l pl-4">
                          {
                            record.log.event_utcexec != null ? (
                              <>
                                <p>{`➜ ${record.log.event_data}`}</p>
                                {
                                  record.log.output.length !== 0
                                    ? (
                                      <pre>
                                        {
                                          parseEscapedChar(JSON.stringify(record.log.output))
                                            .substring(1, record.log.output.length)
                                        }
                                      </pre>
                                    )
                                    : null
                                }
                              </>
                            )
                              : null
                          }
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              />
            </td>
            <td className="w-1/2">
              <strong>Queued Events</strong>
              <Table
                columns={queueColumns}
                dataSource={queueState}
                expandedRowRender={(record) => (
                  <table>
                    <tbody>
                      <tr className="align-top w-full pr-4">
                        <td className="w-1/2">
                          {
                            Object.keys(record.log).map((key) => (
                              <tr>
                                <td>
                                  {`${key}:`}
                                </td>
                                <td>
                                  {record.log[key]}
                                </td>
                              </tr>
                            ))
                          }
                        </td>
                        <td className="w-1/2 border-l pl-4">
                          {
                            record.log.event_utcexec != null ? (
                              <>
                                <p>{`➜ ${record.log.event_data}`}</p>
                                {
                                  record.log.output.length !== 0
                                    ? (
                                      <pre>
                                        {
                                          parseEscapedChar(JSON.stringify(record.log.output))
                                            .substring(1, record.log.output.length)
                                        }
                                      </pre>
                                    )
                                    : null
                                }
                              </>
                            )
                              : null
                          }
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </BaseComponent>
  );
}

MissionEventsDisplay.propTypes = {
  /** Nodes to retrieve commands from and to display */
  nodes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default MissionEventsDisplay;
