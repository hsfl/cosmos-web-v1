import React, {
  useState, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  Input,
  InputNumber,
  Select,
  Tooltip,
  message,
  Button,
  Popconfirm,
  DatePicker,
  Radio,
} from 'antd';
import {
  CloseOutlined, RetweetOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

// import Search from 'antd/lib/input/Search';
import { axios } from '../../api';
import { dateToMJD } from '../../utility/time';

import BaseComponent from '../BaseComponent';

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
  defaultNodeProcess,
  nodes,
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

  /** DOM Element selector for history log */
  const cliEl = useRef(null);
  /** DOM Element selector for argument input */
  const inputEl = useRef(null);

  const commandHistoryEl = useRef(null);
  commandHistoryEl.current = commandHistory;

  const queryCommands = async (query = false, timeToSend = null, type = 'exec') => {
    try {
      if (query) {
        try {
          await axios.post(`/${type}/${commandNode}`, {
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
      }

      const { data } = await axios.get(`/commands/${commandNode}`);

      setCommands(data);
    } catch (error) {
      message.error('Could not query commands from database.');
    }
  };

  useEffect(() => {
    const incomingInfo = Object.keys(incoming).find((el) => el.split(':')[1] === 'executed');
    if (incomingInfo != null) {
      setCommandHistory([
        ...commandHistoryEl.current,
        `${dayjs.utc().format()} ${incomingInfo}`,
      ]);
    }
  }, [incoming]);

  const loadAgentRequests = (req) => {
    const sortedRequests = [];
    const requests = {};

    // Clear agent requests for new agent
    req.forEach((request) => {
      console.log(request);
      sortedRequests.push(
        request.token,
      );

      // Make commands mapped into an object
      requests[request.token] = {
        ...request,
      };
    });

    // Set agent requests
    setAgentRequests(requests);
    setSortedAgentRequests(sortedRequests);
  };

  const sendCommandApi = async (route, command) => {
    setCommandHistory([
      ...commandHistoryEl.current,
      `➜ ${dayjs.utc().format()} ${command}`,
    ]);

    setUpdateLog(true);
    try {
      const { data } = await axios.post(`/commands/${route}`, { command });
      if (data) {
        const json = JSON.parse(data);
        if (json.output && json.output.requests) {
          loadAgentRequests(json.output.requests);
          message.destroy();
          message.success('Retrieved agent requests.');
        } else if (json.error) {
          throw new Error(data.error);
        } else {
          setCommandHistory([
            ...commandHistoryEl.current,
            `${dayjs.utc().format()} ${data.output}`,
          ]);
        }
      } else {
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
        sendCommandApi('agent', commandArguments);
        break;
      case '> command_generator':
        sendCommandApi('command_generator', commandArguments.replace(/"/g, "'"));
        break;
      default:
        sendCommandApi('agent', `${selectedAgent[0]} ${selectedAgent[1]} ${selectedRequest} ${macro ? `${macro} ` : ''}${commandArguments}`);
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
      sendCommandApi('agent', `${agent[0]} ${agent[1]} help_json`);
    }
  };

  useEffect(() => {
    queryCommands();

    if (defaultNodeProcess) {
      getRequests(defaultNodeProcess.split(':'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <pre className="text-xs">
          {
            allCommands.join(' ')
          }
        </pre>
      </div>
    );
  };

  return (
    <BaseComponent
      name="Commands"
      subheader=""
      liveOnly
      showStatus={false}
    >
      <div className="flex flex-wrap">
        <div
          className="w-full"
        >
          <Select
            className="block mb-2"
            dropdownMatchSelectWidth={false}
            onChange={(value) => getRequests([commandNode, value])}
            placeholder="Select agent node and process"
            defaultValue={defaultNodeProcess}
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
              onBlur={() => queryCommands()}
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
            <Radio.Group>
              <Popconfirm
                placement="top"
                title={`Send '${commandNode} ➜ ${sending.event_data}'?`}
                onConfirm={() => queryCommands('send', timeSend)}
                okText="Yes"
                cancelText="No"
              >
                <Radio.Button
                  disabled={timeSend === null || macroCommand === null}
                >
                  Direct Send
                </Radio.Button>
              </Popconfirm>
              <Popconfirm
                placement="top"
                title={`Send '${commandNode} ➜ ${sending.event_data}'?`}
                onConfirm={() => queryCommands('send', timeSend, 'command')}
                okText="Yes"
                cancelText="No"
              >
                <Radio.Button
                  className="mr-2"
                  disabled={timeSend === null || macroCommand === null}
                >
                  File Send
                </Radio.Button>
              </Popconfirm>
            </Radio.Group>
            <RetweetOutlined className="mt-2 mr-2" />
            <InputNumber
              className="h-8 mr-2 w-12"
              formatter={(val) => `${val}s`}
              parser={(val) => val.replace('s', '')}
              min={0}
              max={60}
              onChange={(val) => setElapsedTime(val)}
            />
            <Radio.Group>
              <Popconfirm
                placement="top"
                title={`Send '${commandNode} ➜ ${sending.event_data}' ${elapsedTime} seconds from now?`}
                onConfirm={() => queryCommands('send', dayjs().add(elapsedTime, 's'))}
                okText="Yes"
                cancelText="No"
              >
                <Radio.Button
                  disabled={elapsedTime === null || macroCommand === null}
                >
                  Direct Send
                </Radio.Button>
              </Popconfirm>
              <Popconfirm
                placement="top"
                title={`Send '${commandNode} ➜ ${sending.event_data}' ${elapsedTime} seconds from now?`}
                onConfirm={() => queryCommands('send', dayjs().add(elapsedTime, 's'), 'command')}
                okText="Yes"
                cancelText="No"
              >
                <Radio.Button
                  className="mr-2"
                  disabled={elapsedTime === null || macroCommand === null}
                >
                  File Send
                </Radio.Button>
              </Popconfirm>
            </Radio.Group>
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
            &nbsp;
            <Button
              onClick={() => {
                sendCommandApi('agent', `neutron1 radio_trxvu_ground_sim send_cmd 1 ${process.env.TRXVU_PASS} ${sending.event_data}`);
              }}
              disabled={macroCommand === null}
            >
              Send Agent Request
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
        className="border border-gray-300 rounded mb-2 p-4 bg-white font-mono h-64 max-h-full resize-y overflow-y-auto"
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
  /** Default node:process */
  defaultNodeProcess: PropTypes.string,
  /** List of nodes available to be able to send commands to */
  nodes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

Commands.defaultProps = {
  defaultNodeProcess: null,
};

export default React.memo(Commands);
