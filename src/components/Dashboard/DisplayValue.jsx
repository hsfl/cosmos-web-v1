import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  Form, Input, Collapse, Button,
} from 'antd';
import moment from 'moment-timezone';

import BaseComponent from '../BaseComponent';
import DisplayValuesTable from './DisplayValues/DisplayValuesTable';

const { Panel } = Collapse;
const { TextArea } = Input;

const editFormStyle = {
  height: '6px',
  width: '6px',
  marginBottom: '2px',
};

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
  const state = useSelector((s) => s.data);

  /** Storage for global form values */
  const [displayValuesForm] = Form.useForm();
  /** Form for adding new values */
  const [newForm] = Form.useForm();
  /** Form for editing values */
  const [editForm] = Form.useForm();

  /** The state that manages the component's title */
  const [nameState, setNameState] = useState(name);
  /** The state that manages the global node process */
  const [globalNodeProcess, setGlobalNodeProcess] = useState('');
  /** Initial form values for editForm */
  const [initialValues, setInitialValues] = useState({});

  /** Store the display values here */
  const [displayValuesState, setDisplayValuesState] = useState(displayValues);
  /** Variable to update to force component update */
  const [updateComponent, setUpdateComponent] = useState(false);

  /** Initialize form components for each display value */
  useEffect(() => {
    let accumulate = {};

    let check = (displayValues != null && displayValues.length !== 0)
      ? displayValues[0].nodeProcess : null;

    // Initialize form values for each value
    displayValues.forEach(({
      name: nameVal, nodeProcess, dataKey, processDataKey, unit,
    }, i) => {
      accumulate = {
        ...accumulate,
        [`name_${i}`]: nameVal,
        [`nodeProcess_${i}`]: nodeProcess,
        [`dataKey_${i}`]: dataKey,
        [`processDataKey_${i}`]: processDataKey
          ? processDataKey.toString().replace(/^(.+\s?=>\s?)/, 'return ').replace(/^(\s*function\s*.*\([\s\S]*\)\s*{)([\s\S]*)(})/, '$2').trim()
          : 'return x',
        [`unit_${i}`]: unit,
      };

      if (check !== nodeProcess && check !== ' ') {
        check = ' ';
      }
    });

    if (check !== ' ') {
      setGlobalNodeProcess(check);
    } else {
      setGlobalNodeProcess('');
    }

    setInitialValues(accumulate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Handle new data incoming from the Context */
  useEffect(() => {
    // Loop through the currently displayed values
    displayValuesState.forEach((v, i) => {
      // Check if the state change involves any of the displayed values
      // by checking the node process and the key it is watching
      if (state && state[v.nodeProcess]
        && state[v.nodeProcess][v.dataKey] !== undefined
        && state[v.nodeProcess].node_utc
      ) {
        // If it does, change the value
        displayValuesState[i].value = state[v.nodeProcess][v.dataKey];
        displayValuesState[i].node_utc = moment.unix((((state[v.nodeProcess].node_utc + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DDTHH:mm:ss');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  /** Process edit value form */
  const processForm = (id) => {
    // Destructure form, field, index to retrieve changed field
    const [form, field, index] = id.split('_');

    // Check type of form
    if (form === 'displayValuesForm') {
      switch (field) {
        case 'name':
          // Update name state
          setNameState(displayValuesForm.getFieldsValue()[field]);
          break;
        case 'globalNodeProcess': {
          const nodeProcessVal = displayValuesForm.getFieldsValue()[field];

          // Modify nodeProcess values in state and on form
          displayValuesState.forEach((value, i) => {
            displayValuesState[i].nodeProcess = nodeProcessVal;

            editForm.setFieldsValue({
              [`nodeProcess_${i}`]: nodeProcessVal,
            });
          });

          setUpdateComponent(!updateComponent);
          break;
        }
        default:
          break;
      }
    } else if (form === 'editForm') {
      // Copy display values to replace index and field value
      const displayValuesCopy = displayValuesState;

      // Create function for processDataKey, O.W. for inputs just set value
      displayValuesCopy[index][field] = field !== 'processDataKey'
        ? editForm.getFieldsValue()[`${field}_${index}`]
        : new Function('x', editForm.getFieldsValue()[`${field}_${index}`]); // eslint-disable-line no-new-func

      // Update state
      setDisplayValuesState(displayValuesCopy);
    }
  };

  /** Process new value form */
  const onFinish = ({
    name: nameVal,
    nodeProcess,
    dataKey,
    processDataKey,
    unit,
  }) => {
    // Append new value to array
    const displayValuesCopy = displayValuesState;

    displayValuesCopy.push({
      name: nameVal || '',
      nodeProcess,
      dataKey,
      processDataKey: processDataKey
        ? new Function('x', processDataKey) // eslint-disable-line no-new-func
        : (x) => x,
      unit: unit || '',
    });

    setDisplayValuesState(displayValuesCopy);

    // Set edit value default form values
    const newIndex = displayValuesCopy.length - 1;

    editForm.setFieldsValue({
      [`name_${newIndex}`]: nameVal,
      [`nodeProcess_${newIndex}`]: nodeProcess,
      [`dataKey_${newIndex}`]: dataKey,
      [`processDataKey_${newIndex}`]: processDataKey.replace(/^(.+\s?=>\s?)/, 'return ').replace(/^(\s*function\s*.*\([\s\S]*\)\s*{)([\s\S]*)(})/, '$2').trim(),
      [`unit_${newIndex}`]: unit,
    });

    // Clear form
    newForm.resetFields();
  };

  return (
    <BaseComponent
      name={nameState}
      liveOnly
      showStatus
      height={height}
      status={displayValuesState.length === 0 ? 'default' : 'success'}
      formItems={(
        <>
          {/* Global forms */}
          <Form
            form={displayValuesForm}
            layout="vertical"
            name="displayValuesForm"
            initialValues={{
              name,
              globalNodeProcess,
            }}
          >
            <Form.Item label="Name" name="name" hasFeedback>
              <Input onBlur={({ target: { id } }) => processForm(id)} />
            </Form.Item>
            <Form.Item label="Global Node Process" name="globalNodeProcess" hasFeedback help="Change all nodes and processes within this component.">
              <Input onBlur={({ target: { id } }) => processForm(id)} />
            </Form.Item>
          </Form>

          <br />

          {/* Modify values forms */}
          <Form
            layout="vertical"
            initialValues={initialValues}
            name="editForm"
            form={editForm}
          >
            <Collapse
              bordered
            >
              {
                displayValuesState.map((displayValue, i) => (
                  <Panel
                    header={(
                      <span className="text-gray-600">
                        <span className="inline-block rounded-full mr-2 indicator" style={editFormStyle} />
                        <strong>
                          {displayValue.nodeProcess}
                        </strong>
                        &nbsp;
                        <span>
                          {displayValue.name}
                        </span>
                      </span>
                    )}
                    key={`${displayValue.name}${displayValue.nodeProcess}${displayValue.dataKey}`}
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
                    <Form.Item label="Name" name={`name_${i}`} hasFeedback>
                      <Input placeholder="Name" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Node Process" name={`nodeProcess_${i}`} hasFeedback>
                      <Input placeholder="Node Process" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Data Key" name={`dataKey_${i}`} hasFeedback>
                      <Input placeholder="Data Key" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Process Data Key" name={`processDataKey_${i}`} hasFeedback help="Define the function body (in JavaScript) here to process the variable 'x'.">
                      <TextArea placeholder="Process Data Key" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Unit" name={`unit_${i}`} hasFeedback>
                      <Input placeholder="Unit" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>
                  </Panel>
                ))
              }
            </Collapse>
          </Form>

          <br />

          {/* Add forms */}
          <Form
            form={newForm}
            layout="vertical"
            name="newForm"
            onFinish={onFinish}
            initialValues={{
              processDataKey: 'return x;',
            }}
          >
            <Collapse>
              <Panel header="Add Value" key="add">
                <Form.Item label="Name" name="name" hasFeedback>
                  <Input placeholder="Name" />
                </Form.Item>

                <Form.Item
                  rules={[
                    {
                      required: true,
                      message: 'Node Process is required!',
                    },
                    () => ({
                      validator(rule, value) {
                        if (!value.includes(':')) {
                          return Promise.reject('Must have the format node:process.'); // eslint-disable-line prefer-promise-reject-errors
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                  label="Node Process"
                  name="nodeProcess"
                  hasFeedback
                >
                  <Input placeholder="Node Process" />
                </Form.Item>

                <Form.Item
                  rules={[
                    {
                      required: true,
                      message: 'Data Key is required!',
                    },
                  ]}
                  label="Data Key"
                  name="dataKey"
                  help="Define the function body (in JavaScript) here to process the variable 'x'."
                  hasFeedback
                >
                  <Input placeholder="Data Key" />
                </Form.Item>

                <Form.Item
                  rules={[
                    () => ({
                      validator(rule, value) {
                        if (!value.includes('return')) {
                          return Promise.reject('Must return a value.'); // eslint-disable-line prefer-promise-reject-errors
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                  label="Process Data Key"
                  name="processDataKey"
                  hasFeedback
                >
                  <TextArea placeholder="Process Data Key" />
                </Form.Item>

                <Form.Item label="Unit" name="unit" hasFeedback>
                  <Input placeholder="Unit" />
                </Form.Item>

                <Button
                  type="dashed"
                  block
                  htmlType="submit"
                >
                  Add Value
                </Button>
              </Panel>
            </Collapse>
          </Form>
        </>
      )}
    >
      <DisplayValuesTable
        displayValues={displayValuesState}
      />
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

export default React.memo(DisplayValue);
