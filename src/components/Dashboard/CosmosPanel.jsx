import React from 'react';
import { useSelector } from 'react-redux';
import {
  Badge,
  Button,
  Select,
} from 'antd';
import BaseComponent from '../BaseComponent';

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

  return (
    <BaseComponent
      name="CosmosPanel"
      liveOnly
      toolsSlot={(
        <>
          <span className="mr-3">
            <Badge status="success" />
            &#60;&nbsp;5min
          </span>
          <span className="mr-3">
            <Badge status="warning" />
            &#60;&nbsp;10min
          </span>
          <span className="mr-3">
            <Badge status="error" />
            &#62;&nbsp;10min
          </span>
        </>
      )}
    >
      <div className="flex flex-wrap">
        <div className="w-full">
          <Select
            className="block mb-2"
            dropdownMatchSelectWidth={false}
            onChange={(value) => null}
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
          <div className="flex">
            <div className="mr-2">
              <Select
                showSearch
                className="block mb-2"
                onChange={(value) => null}
                onBlur={() => {}}
                placeholder="Command List"
              >
              </Select>
            </div>
            <div className="border-l mr-2 h-8" />
            &nbsp;
            <Button
              onClick={() => {

              }}
              disabled={true}
            >
              Send Agent Request
            </Button>
          </div>
          <div className="flex">
            <RecursiveProperty data={namespacenames} title="Names" isRoot />
          </div>
        </div>
      </div>
      {
        // Agent selector
        // console.log(agentList)
      }
      {
        // Cosmosstruc value
      }
    </BaseComponent>
  );
}

export default React.memo(CosmosPanel);
