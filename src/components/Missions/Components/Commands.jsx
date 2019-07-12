import React, { useState, useEffect } from 'react';
import { Input, Select, Tooltip } from 'antd';

import BaseComponent from '../BaseComponent';

/**
 * Send commands to agents. Simulates a CLI.
 */
function Commands() {
  const [wsCommand] = useState(new WebSocket(`ws://${process.env.REACT_APP_WEBSOCKET_IP}:${process.env.REACT_APP_QUERY_WEBSOCKET_PORT}/command/`));

  /** Agents */
  const [agentList, setAgentList] = useState([]);
  /** Selected agent to get requests from */
  const [selectedAgent, setSelectedAgent] = useState([]);
  /** Requests possible from selectedAgent */
  const [agentRequests, setAgentRequests] = useState([]);
  /** Selected agent request */
  const [selectedRequest, setSelectedRequest] = useState('> agent');
  /** Agent command arguments */
  const [commandArguments, setCommandArguments] = useState('');
  /** Agent command history (to display in the terminal) */
  const [commandHistory, setCommandHistory] = useState([]);

  /** Manages requests for agent list and agent [node] [process] */
  wsCommand.onmessage = ({ data }) => {
    let json;

    try {
      json = JSON.parse(data);
    } catch (err) {
      // console.log(err);
    }

    console.log(data);

    if (json && json.agent_list) {
      // agent list
      setAgentList(json.agent_list);
    } else if (json && json.output && json.output.requests) {
      // agent node proc
      setAgentRequests(json.output.requests);
    } else if (json && json.output) {
      // agent node proc cmd
      setCommandHistory([...commandHistory, json.output]);
    }
  };

  /** On mount get list of agents */
  useEffect(() => {
    wsCommand.onopen = () => {
      wsCommand.send('list_json');
    };

    return () => {
      wsCommand.close();
    };
  }, []);

  /** Handle submission of agent command */
  const sendCommand = (ws) => {
    if (selectedRequest === '> agent') {
      ws.send(commandArguments);
      setCommandHistory([...commandHistory, `➜ agent ${commandArguments}`]);
    } else {
      ws.send(`${selectedAgent[0]} ${selectedAgent[1]} ${selectedRequest} ${commandArguments}`);
      setCommandHistory([...commandHistory, `➜ agent ${selectedAgent[0]} ${selectedAgent[1]} ${selectedRequest} ${commandArguments}`]);
    }
  };

  const getRequests = (ws) => {
    if (selectedAgent.length > 0) {
      ws.send(`${selectedAgent[0]} ${selectedAgent[1]} help_json`);
    }
  };

  /** Watches for changes to selectedAgent. Then sends WS message to get list of commands. */
  useEffect(() => {
    getRequests(wsCommand);
  }, [selectedAgent]);

  return (
    <BaseComponent
      name="Agent Commands"
      subheader=""
      liveOnly
      showStatus={false}
    >
      <Select
        className="w-full mb-2"
        dropdownMatchSelectWidth={false}
        onChange={(value) => {
          setAgentRequests([]);
          setSelectedAgent(value.split(':'));
        }}
        placeholder="Select agent node and process"
      >
        {
          agentList.map(({ agent_node: node, agent_proc: proc }) => {
            return (
              <Select.Option
                key={`${node}:${proc}`}
                value={`${node}:${proc}`}
              >
                {node}
                :&nbsp;
                {proc}
              </Select.Option>
            );
          })
        }
      </Select>
      <div className="border border-gray-300 rounded mb-2 p-4 bg-white font-mono h-32 max-h-full resize-y overflow-y-scroll">
        {
          commandHistory.map((command, i) => (<div key={i}>{ command }</div>))
        }
      </div>
      <div className="flex">
        <Input
          addonBefore={(
            <Select
              className="w-auto"
              defaultValue="> agent"
              dropdownMatchSelectWidth={false}
              onChange={value => setSelectedRequest(value)}
            >
              <Select.Option value="> agent">
                <Tooltip placement="topLeft" title="node process [arguments]">
                  ➜ agent
                </Tooltip>
              </Select.Option>
              {
                agentRequests.map(({ token, synopsis, description }) => {
                  return (
                    <Select.Option value={token} key={token}>
                      <Tooltip placement="topLeft" title={`${synopsis ? `${synopsis} ` : ''}${description}`}>
                        { token }
                      </Tooltip>
                    </Select.Option>
                  );
                })
              }
            </Select>
          )}
          addonAfter={(
            <div
              className="cursor-pointer text-blue-600 hover:text-blue-400"
              onClick={() => {
                sendCommand(wsCommand);
                setCommandArguments('');
              }}
            >
              Send
            </div>
          )}
          placeholder="Arguments"
          onChange={({ target: { value } }) => setCommandArguments(value)}
          onPressEnter={() => {
            sendCommand(wsCommand);
            setCommandArguments('');
          }}
          value={commandArguments}
        />
      </div>
    </BaseComponent>
  );
}

Commands.propTypes = {};

Commands.defaultProps = {};

export default Commands;