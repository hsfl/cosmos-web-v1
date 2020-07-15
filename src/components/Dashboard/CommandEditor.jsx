import React, {
  useState, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  Tabs,
  Form,
  Input,
  InputNumber,
  Select,
  Tooltip,
  message,
  Button,
  Popconfirm,
  DatePicker,
} from 'antd';
import {
  CloseOutlined, ExclamationCircleOutlined, SendOutlined, RetweetOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

// import Search from 'antd/lib/input/Search';
import { axios } from '../../api';
import { dateToMJD } from '../../utility/time';

import BaseComponent from '../BaseComponent';

const { TabPane } = Tabs;

const minWidth = {
  minWidth: '5em',
};

/**
 * Send commands to agents through agent mongo web socket. Simulates a CLI.
 * Gives the ability to select commonly used node:process; appends this value to after the `agent`
 * command.
 * Allows for running agent commands. Logs inputs and ouputs in the white box above the input box.
 */
function Commands({
  nodes,
  height,
}) {
  /** Agents */
  // const [agentList, setAgentList] = useState([]);
  const list = useSelector((s) => s.list.agent_list);
  const macro = useSelector((s) => s.macro);
  const incoming = useSelector((s) => s.data);

  /** Selected agent to get requests from */
  const [selectedAgent, setSelectedAgent] = useState([]);
  /** Requests possible from selectedAgent */
  const [agentRequests, setAgentRequests] = useState({});
  /** List of sorted agent requests */
  const [sortedAgentRequests, setSortedAgentRequests] = useState([]);
  /** Selected agent request */
  const [selectedRequest, setSelectedRequest] = useState('> agent');
  /** Agent command arguments */
  const [commandArguments, setCommandArguments] = useState('');
  /** Agent command history (to display in the terminal) */
  const [commandHistory, setCommandHistory] = useState([]);
  /** Save the last sent argument value */
  const [lastArgument, setLastArgument] = useState('');
  /** Auto scroll the history log to the bottom */
  const [updateLog, setUpdateLog] = useState(null);
  /** Store autocompletions */
  const [autocompletions, setAutocompletions] = useState([]);
  /** Currently selected dropdown value of command list */
  const [macroCommand, setMacroCommand] = useState(null);

  /** Node to send data to */
  const [commandNode, setCommandNode] = useState(nodes[0]);
  /** List of commands stored in the node */
  const [commands, setCommands] = useState([]);
  /** Command to be sent */
  const [sending, setSending] = useState({});
  /** Time to send command */
  const [timeSend, setTimeSend] = useState(null);
  /** Time to send command */
  const [elapsedTime, setElapsedTime] = useState(0);
  /** Form to create a new command */
  const [commandForm] = Form.useForm();
  /** The command selected to be deleted */
  const [selected, setSelected] = useState(null);
  /** The global node to create/delete commands from */
  const [globalNode, setGlobalNode] = useState(commandNode);
  /** List of commands from the global node selected */
  const [deleteList, setDeleteList] = useState([]);

  /** DOM Element selector for history log */
  const cliEl = useRef(null);
  /** DOM Element selector for argument input */
  const inputEl = useRef(null);

  const commandHistoryEl = useRef(null);
  commandHistoryEl.current = commandHistory;

  const queryCommands = async (query = null, timeToSend = null) => {
    try {
      let data;
      switch (query) {
        case 'send':
          try {
            await axios.post(`/exec/${commandNode}`, {
              event: {
                event_data: sending.event_data,
                event_utc: timeToSend != null ? dateToMJD(dayjs()) : timeToSend,
                event_type: sending.event_type,
                event_flag: sending.event_flag,
                event_name: sending.event_name,
              },
            });
            setCommandHistory([
              ...commandHistoryEl.current,
              `➜ ${dayjs.utc().format()} ${commandNode} ${sending.event_data}`,
            ]);
            message.success(`Command '${sending.event_name}' has been sent to ${commandNode}!`);
          } catch {
            message.error(`Error executing ${macroCommand} on ${commandNode}.`);
          }
          break;
        case 'delete':
          try {
            data = await axios.delete(`/commands/${globalNode}`, {
              data: {
                event_name: selected,
              },
            });
            message.success(`${selected} deleted successfully.`);
            setSelected(null);
          } catch (err) {
            message.error(`Error deleting ${selected}.`);
          }
          break;
        default:
          break;
      }

      data = await axios.get(`/commands/${commandNode}`);

      setCommands(data.data);
      if (commandNode === globalNode) {
        setDeleteList(data.data);
      } else {
        data = await axios.get(`/commands/${globalNode}`);
        setDeleteList(data.data);
      }
    } catch (error) {
      message.error('Could not query commands from database.');
    }
  };

  /** Generate commands in database */
  const createCommand = async () => {
    const form = commandForm.getFieldsValue();

    if (deleteList.find((command) => command.event_name === form.name)) {
      message.error('Duplicate command cannot be created.');
    } else {
      try {
        await axios.post(`/commands/${globalNode}`, {
          command: {
            event_name: form.name,
            event_type: form.type,
            event_flag: form.flag,
            event_data: form.command,
          },
        });
        message.success(`Successfully created ${form.name}!`);
      } catch {
        message.error(`Error creating ${form.name}`);
      }

      commandForm.resetFields();
    }

    queryCommands();
  };

  useEffect(() => {
    queryCommands();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const incomingInfo = Object.keys(incoming).find((el) => el.split(':')[1] === 'executed');
    if (incomingInfo != null) {
      setCommandHistory([
        ...commandHistoryEl.current,
        `${dayjs.utc().format()} ${incomingInfo}`,
      ]);
    }
  }, [incoming]);

  /** Manages requests for agent list and agent [node] [process] */
  const sendCommandApi = async (command) => {
    setCommandHistory([
      ...commandHistoryEl.current,
      `➜ ${dayjs.utc().format()} ${command}`,
    ]);

    setUpdateLog(true);

    // retrieve command output
    try {
      const { data } = await axios.post('/command', {
        data: {
          command,
        },
      });

      try {
        const json = JSON.parse(data);

        // json checking for json.output, json.error
        if (json && json.output && json.output.requests) {
          const sortedRequests = [];
          const requests = {};

          // Clear agent requests for new agent
          json.output.requests.forEach((request) => {
            sortedRequests.push(
              request.token,
            );

            // Make commands mapped into an object
            requests[request.token] = {
              ...request,
            };
          });

          // Alphabetical order
          sortedRequests.sort();

          // Set agent requests
          setAgentRequests(requests);
          setSortedAgentRequests(sortedRequests);

          message.destroy();
          message.success('Retrieved agent requests.');
        } else if (json && json.output) {
          // agent node proc cmd
          setCommandHistory([
            ...commandHistoryEl.current,
            `${dayjs.utc().format()} ${data.output}`,
          ]);

          message.destroy();
        } else if (json && json.error) {
          throw new Error(json.error);
        } else {
          throw new Error();
        }
      } catch (error) {
        message.destroy();
        // non-json
        setCommandHistory([
          ...commandHistoryEl.current,
          `${dayjs.utc().format()} ${data}`,
        ]);
      }
      setUpdateLog(true);
    } catch (error) {
      message.destroy();
      message.error(error.message);
    }
  };

  /** Handle submission of agent command */
  const sendCommand = async () => {
    setLastArgument(commandArguments);

    switch (selectedRequest) {
      case '> agent':
        sendCommandApi(`${process.env.COSMOS_BIN}agent ${commandArguments}`);
        break;
      case '> command_generator':
        sendCommandApi(`${process.env.COSMOS_BIN}command_generator ${commandArguments.replace(/"/g, "'")}`);
        break;
      default:
        sendCommandApi(`${process.env.COSMOS_BIN}agent ${selectedAgent[0]} ${selectedAgent[1]} ${selectedRequest} ${macro ? `${macro} ` : ''}${commandArguments}`);
        break;
    }

    setUpdateLog(true);
  };

  /** Retrieve file autocompletion */
  const getAutocomplete = async (autocomplete) => {
    setCommandHistory([
      ...commandHistory,
      `autocomplete ${autocomplete}`,
    ]);

    // retrieve autocompletions
    const { data } = await axios.post('/command', {
      responseType: 'text',
      data: {
        command: `compgen -c ${autocomplete}`,
      },
    });

    setAutocompletions(data.split('\n'));
  };

  /** Autocomplete automatically if it's the only one in the array */
  useEffect(() => {
    if (autocompletions.length === 2) {
      const args = commandArguments.split(' ');

      // eslint-disable-next-line prefer-destructuring
      args[args.length - 1] = autocompletions[0];

      setCommandArguments(args.join(' '));

      setAutocompletions([]);

      setUpdateLog(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autocompletions]);

  /** Get the possible requests for selected agent */
  const getRequests = async (agent) => {
    setSelectedAgent(agent);

    setSortedAgentRequests([]);
    setAgentRequests({});

    if (agent.length > 0) {
      sendCommandApi(`${process.env.COSMOS_BIN}agent ${agent[0]} ${agent[1]} help_json`);
    }
  };

  /** Update height of the history log to go to the bottom */
  useEffect(() => {
    cliEl.current.scrollTop = cliEl.current.scrollHeight;
    setUpdateLog(null);
  }, [updateLog]);

  const colorTime = (command, i) => {
    const allCommands = command.split(' ');

    if (allCommands[0] === '➜') {
      allCommands.splice(0, 1);
      const time = allCommands.splice(0, 1);

      return (
        <div key={i}>
          ➜&nbsp;
          <span className="text-gray-600">
            [
            {time}
            ]
          </span>
          &nbsp;
          { allCommands.join(' ')}
        </div>
      );
    }

    const time = allCommands.splice(0, 1);

    return (
      <div key={i}>
        <span className="text-gray-600">
          [
          {time}
          ]
        </span>
        &nbsp;
        {
          allCommands.join(' ')
        }
      </div>
    );
  };

  return (
    <BaseComponent
      name="Commands"
      subheader=""
      liveOnly
      height={height}
      showStatus={false}
      formItems={(
        <>
          <div>
            Target Node:
            <Select
              className="ml-2 w-32"
              showSearch
              onChange={(value) => setGlobalNode(value)}
              onBlur={() => queryCommands()}
              placeholder="Select target node"
              defaultValue={globalNode}
              value={globalNode}
            >
              {
                nodes.map((n) => (
                  <Select.Option
                    key={n}
                  >
                    {n}
                  </Select.Option>
                ))
              }
            </Select>
          </div>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Create Command" key="1">
              <Form
                form={commandForm}
                layout="vertical"
                name="commandForm"
                onFinish={() => createCommand()}
              >
                <table className="w-full">
                  <tbody>
                    <tr>
                      <th>
                        <Form.Item
                          className="font-light w-4/5"
                          label="Event Name"
                          name="name"
                          rules={[{ required: true, message: 'Please type a name.' }]}
                        >
                          <Input placeholder="Name" />
                        </Form.Item>
                      </th>
                      <th rowSpan={2}>
                        <Form.Item
                          className="font-light"
                          label="Type"
                          name="type"
                          rules={[{ required: true, message: 'Please choose a type.' }]}
                        >
                          <InputNumber placeholder="#" />
                        </Form.Item>
                      </th>
                      <th>
                        <Form.Item
                          className="font-light"
                          label="Flag"
                          name="flag"
                          rules={[{ required: true, message: 'Please choose a flag.' }]}
                        >
                          <InputNumber placeholder="#" />
                        </Form.Item>
                      </th>
                    </tr>
                  </tbody>
                </table>
                <Form.Item
                  label="Command"
                  name="command"
                  rules={[{ required: true, message: 'Please type a command.' }]}
                >
                  <Input placeholder="ex: ls, /bin/systemctl stop agent_cpu" prefix="➜" />
                </Form.Item>
                <hr className="mb-6" />
                <Form.Item>
                  <Button htmlType="submit" type="primary">
                    Create
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            <TabPane tab="Delete Command" key="2">
              <Select
                placeholder="Select command to delete"
                className="w-full mb-4"
                onChange={(value) => setSelected(value)}
              >
                {deleteList.map((com) => (
                  <Select.Option
                    key={com.event_name}
                  >
                    {com.event_name}
                  </Select.Option>
                ))}
              </Select>
              <hr className="mb-5" />
              <Popconfirm
                placement="right"
                title={`Are you sure you want to delete '${selected}' for ${globalNode}?`}
                onConfirm={() => queryCommands('delete')}
                okText="Yes"
                cancelText="No"
                icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
              >
                <Button
                  type="primary"
                  disabled={!selected}
                  danger
                >
                  Delete
                </Button>
              </Popconfirm>
            </TabPane>
          </Tabs>
        </>
      )}
    >
      <div className="flex flex-wrap">
        <div
          className="w-full"
        >
          <Select
            className="block mb-2"
            dropdownMatchSelectWidth={false}
            onChange={(value) => getRequests(value.split(':'))}
            placeholder="Select agent node and process"
          >
            {
              list ? list.map(({ agent }) => (
                <Select.Option
                  key={agent}
                >
                  {agent}
                </Select.Option>
              )) : null
            }
          </Select>
          <div className="flex">
            <Select
              showSearch
              className="mr-2 w-32"
              onChange={(value) => setCommandNode(value)}
              onBlur={() => {
                // Change target node when changing command node
                setGlobalNode(commandNode);
                queryCommands();
              }}
              placeholder="Select node"
              defaultValue={commandNode}
              value={commandNode}
            >
              {
                nodes.map((n) => (
                  <Select.Option
                    key={n}
                  >
                    {n}
                  </Select.Option>
                ))
              }
            </Select>
            <div className="mr-2">
              <Select
                showSearch
                className="block mb-2"
                onChange={(value) => setMacroCommand(value)}
                onBlur={() => {
                  const info = commands.find((command) => command.event_name === macroCommand);
                  if (info) {
                    setSending(info);
                  }
                }}
                placeholder="Command List"
              >
                {
                  commands.map((command) => (
                    <Select.Option
                      key={command.event_name}
                    >
                      {command.event_name}
                    </Select.Option>
                  ))
                }
              </Select>
            </div>
            <div className="border-l mr-2 h-8" />
            <DatePicker
              className="h-8 mr-2"
              showTime
              onChange={(val) => setTimeSend(val)}
            />
            <Popconfirm
              placement="topRight"
              title={`Send '${commandNode} ➜ ${sending.event_data}'?`}
              onConfirm={() => queryCommands('send', timeSend)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                icon={<SendOutlined />}
                className="mr-2"
                disabled={timeSend === null || macroCommand === null}
              >
                Send
              </Button>
            </Popconfirm>
            <RetweetOutlined className="mt-2 mr-2" />
            <InputNumber
              className="h-8 mr-2 w-12"
              formatter={(val) => `${val}s`}
              parser={(val) => val.replace('s', '')}
              min={0}
              max={60}
              onChange={(val) => setElapsedTime(val)}
            />
            <Popconfirm
              placement="topRight"
              title={`Send '${commandNode} ➜ ${sending.event_data}' ${elapsedTime} seconds from now?`}
              onConfirm={() => queryCommands('send', dayjs().add(elapsedTime, 's'))}
              okText="Yes"
              cancelText="No"
            >
              <Button
                icon={<SendOutlined />}
                className="mr-2"
                disabled={macroCommand === null || elapsedTime === null}
              >
                Send
              </Button>
            </Popconfirm>
            <div className="border-l mr-2 h-8" />
            <Button
              onClick={() => {
                message.loading('Querying...');
                queryCommands();
                message.destroy();
                message.success('Querying complete.');
              }}
              type="dashed"
            >
              Re-query Command List
            </Button>
          </div>
        </div>
        {/* <div className="w-full py-2">
          <Search
            placeholder="Select node:process"
            onSearch={(value) => setSelectedAgent(value.split(':'))}
            enterButton={<SelectOutlined />}
          />
        </div> */}
      </div>
      <div
        className="border border-gray-300 rounded mb-2 p-4 bg-white font-mono h-32 max-h-full resize-y overflow-y-auto"
        ref={cliEl}
      >
        {
          // eslint-disable-next-line
          commandHistory.map((command, i) => (colorTime(command, i)))
        }
        {
          autocompletions.length > 1
            ? (
              <span className="text-red-500 cursor-pointer hover:underline">
                Clear&nbsp;
                <CloseOutlined onClick={() => setAutocompletions([])} />
              </span>
            )
            : ''
        }
        {
          autocompletions.map((autocompletion) => (
            <span
              tabIndex={0}
              role="link"
              onClick={() => {
                // Change the last array element of the command arguments
                // to have selected autocompeleted path
                const args = commandArguments.split(' ');

                args[args.length - 1] = autocompletion;
                setCommandArguments(args.join(' '));

                inputEl.current.focus();
              }}
              onKeyDown={() => { }}
              className="text-blue-500 p-2 hover:underline cursor-pointer"
              key={autocompletion}
            >
              {autocompletion}
            </span>
          ))
        }
      </div>
      <div className="flex">
        <Input
          addonBefore={(
            <Select
              showSearch
              className="w-auto"
              defaultValue="> agent"
              dropdownMatchSelectWidth={false}
              onChange={(value) => setSelectedRequest(value)}
              value={selectedRequest}
              style={minWidth}
            >
              <Select.Option value="> agent">
                <Tooltip placement="right" title="node process [arguments]">
                  ➜ agent
                </Tooltip>
              </Select.Option>
              <Select.Option value="> command_generator">
                <Tooltip placement="right" title="name command [time | +sec] [node] [condition] [repeat_flag]">
                  ➜ command_generator
                </Tooltip>
              </Select.Option>
              {
                sortedAgentRequests.map((token) => (
                  <Select.Option value={token} key={token}>
                    <Tooltip placement="right" title={`${agentRequests[token] && agentRequests[token].synopsis ? `${agentRequests[token].synopsis} ` : ''}${agentRequests[token].description}`}>
                      {token}
                    </Tooltip>
                  </Select.Option>
                ))
              }
            </Select>
          )}
          addonAfter={(
            <div
              className="cursor-pointer text-blue-600 hover:text-blue-400"
              onClick={() => {
                sendCommand();
                setCommandArguments('');
              }}
              onKeyDown={() => { }}
              role="button"
              tabIndex={0}
            >
              Send
            </div>
          )}
          placeholder="Arguments"
          onChange={({ target: { value } }) => setCommandArguments(value)}
          onPressEnter={() => {
            sendCommand();
            setCommandArguments('');
          }}
          onKeyDown={(e) => {
            if (e.keyCode === 38) {
              setCommandArguments(lastArgument);
            } else if (e.keyCode === 9) {
              e.preventDefault();
              getAutocomplete(commandArguments.split(' ')[commandArguments.split(' ').length - 1]);
            }
          }}
          value={commandArguments}
          ref={inputEl}
        />
      </div>
    </BaseComponent>
  );
}

Commands.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.string).isRequired,
  height: PropTypes.number.isRequired,
};

export default React.memo(Commands);
