import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Badge,
  Button,
  Input,
  message,
  Select,
} from 'antd';
import {
  RetweetOutlined,
} from '@ant-design/icons';
import BaseComponent from '../BaseComponent';

import { COSMOSAPI } from '../../api';
import RecursiveProperty from './CosmosPanel/RecursiveProperty';
import testraw from './CosmosPanel/testraw';
import { ParseNamesToJSON } from '../../utility/data';

const namespacenames = ParseNamesToJSON(testraw);

/**
 * View, get, and set any value in cosmosstruc
 */
function CosmosPanel() {
  /** Get agent list state from the Context */
  const list = useSelector((s) => s.list.agent_list);
  /** Value of the input text field */
  const inputTextRef = useRef(null);
  /** Value of the selected node:process */
  const nodeProcessRef = useRef(null);
  /** Full name in the namespace */
  const [name, setName] = useState('');
  /** Changed to trigger a rerender */
  const [arbitraryState, setArbitraryState] = useState(false);

  /** Use to update UI based on refs */
  const triggerRerender = () => {
    setArbitraryState(!arbitraryState);
  };

  const getCurrentValue = () => {
    if (nodeProcessRef.current && name) {
      const nodeProcess = nodeProcessRef.current.split(':');
      message.info('Sending agent request...');
      COSMOSAPI.runAgentCommand(
        nodeProcess[0],
        nodeProcess[1],
        `get_value \"${name}\"`,
        (data) => {
          if (data.output) {
            const key = Object.keys(data.output);
            const output = data.output[key];
            inputTextRef.current.state.value = JSON.stringify(output);
            message.success('Agent request successful');
            triggerRerender();
          } else {
            message.error('Agent request returned empty string');
          }
        },
      );
    } else {
      message.error('Please select a node and a namespace name');
    }
  }

  return (
    <BaseComponent
      name="Cosmos Panel"
      liveOnly
      toolsSlot={(
        <>
        </>
      )}
    >
      <div className="flex flex-wrap">
        <div className="flex">
          <Select
            className="inline-block mb-2 w-1/2"
            dropdownMatchSelectWidth={false}
            onChange={(value) => nodeProcessRef.current = value}
            placeholder="Select agent node and process"
          >
            {
              list ? list.map(({ agent, node }) => (
                <Select.Option
                  key={[node, agent].join(':')}
                >
                  {[node, agent].join(':')}
                </Select.Option>
              )) : null
            }
          </Select>
          <Input
            className="inline-block ml-2 mb-2 w-1/2"
            placeholder="Namespace name"
            value={name ? name : ''}
          />
        </div>
      </div>
      <div className="flex">
        <Input
          addonBefore={(
            <div
              role="button"
              onClick={getCurrentValue}
            >
              <RetweetOutlined />
            </div>
          )}
          addonAfter={(
            <div
              className="cursor-pointer text-blue-600 hover:text-blue-400"
              onClick={() => {console.log(nodeProcessRef.current)}}
              role="button"
              tabIndex={0}
            >
              Set
            </div>
          )}
          ref={inputTextRef}
          placeholder="Value"
        />
      </div>
      <div className="flex">
        <RecursiveProperty data={namespacenames} title="Names" isRoot callBack={setName}/>
      </div>
    </BaseComponent>
  );
}

export default React.memo(CosmosPanel);
