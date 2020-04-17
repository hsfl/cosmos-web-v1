import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Form, Input, Collapse, Button,
} from 'antd';
import moment from 'moment-timezone';

import BaseComponent from '../BaseComponent';
import { Context } from '../../store/neutron1';

const { Panel } = Collapse;
const { TextArea } = Input;

/**
 * Displays a specified live value from an agent.
 * Updates values every agent heartbeat.
 */
function DisplayValue({
  name,
  displayValues,
  height,
}) {
  /** Accessing the neutron1 messages from the socket */
  const { state } = useContext(Context);


  const [form] = Form.useForm();

  const [dum, setForm] = useState();
  /** The state that manages the component's title */
  const [nameState, setNameState] = useState(name);
  /** Storage for form values */
  /** Store the form error message. If '', there is no error */
  const [formError, setFormError] = useState('');
  /** Store the display values here */
  const [displayValuesState, setDisplayValuesState] = useState(displayValues);

  /** Initialize form components for each display value */
  useEffect(() => {
    // Make an object for each plot's form
    for (let i = 0; i < displayValuesState.length; i += 1) {
      form[i] = {};
    }
  }, []);

  /** Handle new data incoming from the Context */
  useEffect(() => {
    // Loop through the currently displayed values
    displayValuesState.forEach((v, i) => {
      // Check if the state change involves any of the displayed values
      // by checking the node process and the key it is watching
      if (state[v.nodeProcess]
        && state[v.nodeProcess][v.dataKey] !== undefined
        && state[v.nodeProcess].utc
      ) {
        // If it does, change the value
        displayValuesState[i].value = state[v.nodeProcess][v.dataKey];
        displayValuesState[i].utc = moment.unix((((state[v.nodeProcess].utc + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DDTHH:mm:ss');
      }
    });
  }, [state]);

  const onFieldsChangeAll = (changed) => {
    console.log(changed);
  };

  const onFieldsChange = (changed) => {
    console.log(changed);
  };

  return (
    <BaseComponent
      name={nameState}
      liveOnly
      showStatus
      height={height}
      status={displayValuesState.length === 0 ? 'default' : 'success'}
      formItems={(
        <div>
          <Form
            layout="vertical"
            form={form}
            name="displayValue"
            onFieldsChange={onFieldsChangeAll}
          >
            <Form.Item
              name="Name"
              label="Name"
            >
              <Input />
            </Form.Item>
          </Form>
          <Collapse
            bordered
          >
            {
              displayValuesState.map((displayValue, i) => (
                <Panel
                  header={(
                    <span className="text-gray-600">
                      <span className="inline-block rounded-full mr-2 indicator" style={{ height: '6px', width: '6px', marginBottom: '2px' }} />
                      <strong>
                        {displayValue.nodeProcess}
                      </strong>
                      &nbsp;
                      <span>
                        {displayValue.name}
                      </span>
                    </span>
                  )}
                  key={`${displayValue.nodeProcess}${displayValue.dataKey}`}
                  extra={(
                    <span
                      onClick={(event) => {
                        event.stopPropagation();

                        setDisplayValuesState(displayValuesState.filter((values, j) => j !== i));
                      }}
                      onKeyDown={() => {}}
                      role="button"
                      tabIndex={i}
                    >
                      X
                    </span>
                  )}
                >
                  <Form
                    layout="vertical"
                    onFieldsChange={onFieldsChange}
                  >
                    <Form.Item
                      name="Name"
                      label="Name"
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="Node Process"
                      label="Node Process"
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="Data Key"
                      label="Data Key"
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="Process Data Key"
                      label="Process Data Key"
                    >
                      <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item
                      name="Unit"
                      label="Unit"
                    >
                      <Input />
                    </Form.Item>
                  </Form>
                </Panel>
              ))
            }
          </Collapse>
        </div>
      )}
    >
      {
        displayValuesState.length === 0 ? 'No values to display.' : null
      }
      <table>
        <tbody>
          {
            displayValuesState.map(({ name: label, unit: u }, i) => (
              <tr key={label}>
                <td className="pr-2 text-gray-500 text-right">
                  {label}
                </td>
                <td className="pr-2">
                  {displayValuesState[i].value !== undefined ? `${displayValuesState[i].processDataKey ? displayValuesState[i].processDataKey(displayValuesState[i].value) : displayValuesState[i].value}${u}` : '-'}
                </td>
                <td className="text-gray-500">
                  {displayValuesState[i].utc ? displayValuesState[i].utc : '-'}
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </BaseComponent>
  );
}

DisplayValue.propTypes = {
  /** Name of the component to display at the time */
  name: PropTypes.string,
  /** The values to display */
  displayValues: PropTypes.arrayOf(
    PropTypes.shape({
      /** Display name of the value */
      name: PropTypes.string,
      /** the node:process to pull the value from */
      nodeProcess: PropTypes.string,
      /** The data key to pull the value from */
      dataKey: PropTypes.string,
      /** The function to put the value through to manipulate it */
      processDataKey: PropTypes.func,
      /** The unit of the  */
      unit: PropTypes.string,
    }),
  ),
  height: PropTypes.number.isRequired,
};

DisplayValue.defaultProps = {
  name: '',
  displayValues: [],
};

export default DisplayValue;
