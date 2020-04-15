import React, {
  useState, useEffect, useRef, useContext,
} from 'react';
import PropTypes from 'prop-types';

import {
  Input, Select, Tooltip, message, Button,
} from 'antd';
import { CloseOutlined } from '@ant-design/icons';

import { Context } from '../../store/neutron1';
import BaseComponent from '../BaseComponent';
import { socket } from '../../socket';

const ws = socket('query', '/command/');
// const live = socket('live', '/live/list');

const commands = [
  {
    name: 'app_configure',
  },
  {
    name: 'app_component',
  },
  {
    name: 'app_configure_component',
  },
  {
    name: 'app_install',
  },
  {
    name: 'app_list_components',
  },
  {
    name: 'app_query_properties',
  },
  {
    name: 'configure_device',
  },
  {
    name: 'connect',
  },
  {
    name: 'device_properties',
  },
  {
    name: 'doppler',
  },
  {
    name: 'get_doppler_config',
  },
  {
    name: 'get_gs_location',
  },
  {
    name: 'help',
  },
  {
    name: 'initialize',
  },
  {
    name: 'list_applications',
  },
  {
    name: 'list_devices',
  },
  {
    name: 'list_tracks',
  },
  {
    name: 'set_doppler_config',
  },
  {
    name: 'set_gs_location',
  },
  {
    name: 'set_receive_freq',
  },
  {
    name: 'set_transmit_freq',
  },
  {
    name: 'set_track',
  },
  {
    name: 'update_tle',
  },
];

const buttons = [
  'initialize',
  'app_launch',
  'app_start',
  'app_stop',
  'app_shutdown',
  'app_uninstall',
  'shutdown',
  'list_applications',
];

/**
 * Send commands to agents. Simulates a CLI.
 */
const Commands = React.memo(({
  height,
}) => {
  const { state } = useContext(Context);
  /** Agents */
  // const [agentList, setAgentList] = useState([]);
  /** Selected agent to get requests from */
  const [selectedAgent] = useState(['masdr', 'nordiasoft']);
  /** Requests possible from selectedAgent */
  const [, setAgentRequests] = useState({});
  /** Agent requests alphabetized */
  const [, setSortedAgentRequests] = useState([]);
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

  /** DOM Element selector for history log */
  const cliEl = useRef(null);
  /** DOM Element selector for argument input */
  const inputEl = useRef(null);

  /** Manages requests for agent list and agent [node] [process] */
  ws.onmessage = ({ data }) => {
    try {
      const json = JSON.parse(data);

      const sortedRequests = [];
      const requests = {};

      if (json.output && json.output.requests) {
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

        sortedRequests.sort();

        setAgentRequests(requests);
        setSortedAgentRequests(sortedRequests);

        message.success(`Retrieved agent requests for ${selectedAgent[0]}:${selectedAgent[1]}.`, 5);
      } else if (json && json.output) {
        // agent node proc cmd

        const jsonOutput = JSON.stringify(json.output);

        if (jsonOutput) {
          setCommandHistory([
            ...commandHistory,
            jsonOutput,
          ]);
        } else {
          setCommandHistory([
            ...commandHistory,
            json.output,
          ]);
        }

        setUpdateLog(true);
      } else if (json.error) {
        throw new Error(json.error);
      }
    } catch (error) {
      setCommandHistory([
        ...commandHistory,
        data,
      ]);

      message.error(error.message);
    }
  };

  /** Close ws on unmount */
  useEffect(() => () => ws.close(), []);

  /** Update height of the history log */
  useEffect(() => {
    cliEl.current.scrollTop = cliEl.current.scrollHeight;
    setUpdateLog(null);
  }, [updateLog]);

  /** Handle submission of agent command */
  const sendCommand = () => {
    setLastArgument(commandArguments);

    if (selectedRequest === '> agent') {
      ws.send(`${process.env.COSMOS_BIN}/agent ${commandArguments}`);
      setCommandHistory([
        ...commandHistory,
        `➜ agent ${commandArguments}`,
      ]);
    } else {
      ws.send(`${process.env.COSMOS_BIN}/agent ${selectedAgent[0]} ${selectedAgent[1]} ${selectedRequest} ${state.macro && (selectedRequest.startsWith('app_') || selectedRequest === 'set_doppler_config') ? `${state.macro} ` : ''}${commandArguments}`);
      setCommandHistory([
        ...commandHistory,
        `➜ agent ${selectedAgent[0]} ${selectedAgent[1]} ${selectedRequest} ${state.macro && (selectedRequest.startsWith('app_') || selectedRequest === 'set_doppler_config') ? `${state.macro} ` : ''}${commandArguments}`,
      ]);
    }

    setUpdateLog(true);
  };

  /** Get the possible requests for selected agent */
  const getRequests = () => {
    setSortedAgentRequests([]);
    setAgentRequests({});

    if (selectedAgent.length > 0) {
      ws.send(`${process.env.COSMOS_BIN}/agent ${selectedAgent[0]} ${selectedAgent[1]} help_json`);
    }
  };

  /** Query for autocompleted paths */
  const getAutocomplete = (autocomplete) => {
    const complete = socket('query', '/command/');

    complete.onopen = () => {
      complete.send(`compgen -c ${autocomplete}`);

      complete.onmessage = ({ data }) => {
        setAutocompletions(data.split('\n'));

        complete.close();
      };
    };
  };

  /** Autocomplete if it's the only one in the array */
  useEffect(() => {
    if (autocompletions.length === 2) {
      // Change the last array element of the command arguments to have selected autocompeleted path
      const args = commandArguments.split(' ');

      // eslint-disable-next-line prefer-destructuring
      args[args.length - 1] = autocompletions[0];

      setCommandArguments(args.join(' '));

      // Clear autocompletions once chosen the autocompeleted path
      setAutocompletions([]);
    }
  }, [autocompletions]);

  /** Watches for changes to selectedAgent. Then sends WS message to get list of commands. */
  useEffect(() => {
    getRequests();
  }, [selectedAgent]);

  return (
    <BaseComponent
      name="Commands"
      subheader=""
      liveOnly
      showStatus={false}
      height={height}
    >
      <div className="flex flex-wrap">
        {/* <div
          className="pr-1 w-1/2"
        >
          <Select
            className="block mb-2"
            dropdownMatchSelectWidth={false}
            onChange={(value) => {
              setAgentRequests([]);
              setSelectedAgent(value.split(':'));
            }}
            placeholder="Select agent node and process"
          >
            {
              agentList.map(({ agent }) => (
                <Select.Option
                  key={agent}
                  value={agent}
                >
                  {agent}
                </Select.Option>
              ))
            }
          </Select>
        </div> */}
        <div className="w-full py-2">
          {
            buttons.map((button) => (
              <Button
                key={button}
                className="m-1"
                onClick={() => {
                  ws.send(`${process.env.COSMOS_BIN}/agent ${selectedAgent[0]} ${selectedAgent[1]} ${button} ${state.macro && button.startsWith('app_') ? `${state.macro} ` : ''}`);
                  setCommandHistory([
                    ...commandHistory,
                    `➜ agent ${selectedAgent[0]} ${selectedAgent[1]} ${button} ${state.macro && button.startsWith('app_') ? `${state.macro} ` : ''}`,
                  ]);

                  setUpdateLog(true);
                }}
              >
                {button}
              </Button>
            ))
          }
        </div>
      </div>
      <div
        className="border border-gray-300 rounded mb-2 p-4 bg-white font-mono h-32 max-h-full resize-y overflow-y-auto"
        ref={cliEl}
      >
        {
          // eslint-disable-next-line
          commandHistory.map((command, i) => (<div key={i}>{ command }</div>))
        }
        {
          autocompletions.length > 1 ? <CloseOutlined onClick={() => setAutocompletions([])} className="text-red-500" /> : ''
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
              onKeyDown={() => {}}
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
              style={{ minWidth: '5em' }}
            >
              <Select.Option value="> agent">
                <Tooltip placement="right" title="node process [arguments]">
                  ➜ agent
                </Tooltip>
              </Select.Option>

              {
                commands.map((token) => (
                  <Select.Option
                    value={token.name}
                    key={token.name}
                  >
                    { token.name }
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
              onKeyDown={() => {}}
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
});

Commands.propTypes = {
  height: PropTypes.number.isRequired,
};

export default Commands;
