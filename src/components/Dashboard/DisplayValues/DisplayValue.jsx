import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import {
  Form, Input, Collapse, Button, InputNumber, message,
} from 'antd';

import BaseComponent from '../../BaseComponent';
import DisplayValuesTable from './DisplayValuesTable';

import { setActivity, incrementQueue } from '../../../store/actions';
import { mjdToUTCString, mjdToString } from '../../../utility/time';

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
  const dispatch = useDispatch();
  const queriedData = useSelector((s) => s.queriedData);

  /** Accessing the neutron1 messages from the socket */
  const state = useSelector((s) => s.data);
  const realm = useSelector((s) => s.realm);

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

    let check = displayValues[0].nodeProcess;

    // Initialize form values for each value
    displayValues.forEach(({
      name: nameVal,
      nodeProcess,
      dataKey,
      dataKeyUpperThreshold,
      dataKeyLowerThreshold,
      timeDataKey,
      processDataKey,
      unit,
    }, i) => {
      accumulate = {
        ...accumulate,
        [`name_${i}`]: nameVal,
        [`nodeProcess_${i}`]: nodeProcess,
        [`dataKey_${i}`]: dataKey,
        [`dataKeyUpperThreshold_${i}`]: dataKeyUpperThreshold,
        [`dataKeyLowerThreshold_${i}`]: dataKeyLowerThreshold,
        [`timeDataKey_${i}`]: timeDataKey || 'node_utc',
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
      // SCOTTNOTE: TODO: Make sure nodeprocess is checked for
      if (state && realm && state[realm]
        && state[realm][v.dataKey] !== undefined
        && ((!(process.env.FLIGHT_MODE === 'true') && state[realm].recorded_time)
        || (process.env.FLIGHT_MODE === 'true' && state[realm][v.timeDataKey]))
      ) {
        const value = v.processDataKey(state[realm][v.dataKey]);

        // If it does, change the value
        displayValuesState[i].value = value;

        // If not in flight mode, use recorded_time to avoid chart jumping
        if (process.env.FLIGHT_MODE === 'true' && state[realm][v.timeDataKey]) {
          displayValuesState[i].time = mjdToUTCString(state[realm][v.timeDataKey]);
        } else {
          displayValuesState[i].time = mjdToUTCString(state[realm].recorded_time);
        }

        if (v.dataKeyLowerThreshold
           && value <= v.dataKeyLowerThreshold
        ) {
          dispatch(setActivity({
            status: 'error',
            summary: `${value} ≤ ${v.dataKeyLowerThreshold} ${v.unit}`,
            scope: `for ${v.name}`,
          }));
        }

        if (v.dataKeyUpperThreshold
          && value >= v.dataKeyUpperThreshold
        ) {
          dispatch(setActivity({
            status: 'error',
            summary: `${value} ≥ ${v.dataKeyUpperThreshold} ${v.unit}`,
            scope: `for ${v.name}`,
          }));
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    if (queriedData) {
      displayValuesState.forEach(({ dataKey, timeDataKey, processDataKey }, i) => {
        if (queriedData[dataKey]) {
          if (queriedData[dataKey].length === 0 || queriedData[timeDataKey].length === 0) {
            message.warning(`No data for specified date range in for ${dataKey}/${timeDataKey}.`);
          } else {
            message.success(`Retrieved ${queriedData[dataKey].length} records in ${dataKey}/${timeDataKey}.`);

            const lastValue = queriedData[dataKey][queriedData[dataKey].length - 1];
            const lastTimeValue = queriedData[timeDataKey][queriedData[timeDataKey].length - 1];

            displayValuesState[i].value = processDataKey ? processDataKey(lastValue) : lastValue;
            displayValuesState[i].time = mjdToString(lastTimeValue);
          }
        }
      });

      dispatch(incrementQueue());

      setUpdateComponent(!updateComponent);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queriedData]);

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
    dataKeyLowerThreshold,
    dataKeyUpperThreshold,
    timeDataKey,
    processDataKey,
    unit,
  }) => {
    // Append new value to array
    setDisplayValuesState([
      ...displayValuesState,
      {
        name: nameVal || '',
        nodeProcess,
        dataKey,
        dataKeyLowerThreshold,
        dataKeyUpperThreshold,
        timeDataKey,
        processDataKey: processDataKey
          ? new Function('x', processDataKey) // eslint-disable-line no-new-func
          : (x) => x,
        unit: unit || '',
      },
    ]);

    // Set edit value default form values
    const newIndex = displayValuesState.length;

    editForm.setFieldsValue({
      [`name_${newIndex}`]: nameVal,
      [`nodeProcess_${newIndex}`]: nodeProcess,
      [`dataKey_${newIndex}`]: dataKey,
      [`dataKeyLowerThreshold_${newIndex}`]: dataKeyLowerThreshold,
      [`dataKeyUpperThreshold_${newIndex}`]: dataKeyUpperThreshold,
      [`timeDataKey_${newIndex}`]: timeDataKey,
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
                    key={JSON.stringify(displayValue)}
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

                    <Form.Item label="Data Key Lower Threshold" name={`dataKeyLowerThreshold_${i}`} hasFeedback>
                      <InputNumber placeholder="Data Key Lower Threshold" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Data Key Upper Threshold" name={`dataKeyUpperThreshold_${i}`} hasFeedback>
                      <InputNumber placeholder="Data Key Upper Threshold" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Time Data Key" name={`timeDataKey_${i}`} hasFeedback>
                      <Input placeholder="Time Data Key" onBlur={({ target: { id } }) => processForm(id)} />
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
                        if (!value.includes(':') && value !== 'any') {
                          return Promise.reject('Must have the format node:process or any.'); // eslint-disable-line prefer-promise-reject-errors
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
                  hasFeedback
                >
                  <Input placeholder="Data Key" />
                </Form.Item>

                <Form.Item
                  label="Data Key Lower Threshold"
                  name="dataKeyLowerThreshold"
                  hasFeedback
                >
                  <InputNumber placeholder="Data Key Lower Threshold" />
                </Form.Item>

                <Form.Item
                  label="Data Key Upper Threshold"
                  name="dataKeyUpperThreshold"
                  hasFeedback
                >
                  <InputNumber placeholder="Data Key Upper Threshold" />
                </Form.Item>

                <Form.Item
                  rules={[
                    {
                      required: true,
                      message: 'Time Data Key is required!',
                    },
                  ]}
                  label="Time Data Key"
                  name="timeDataKey"
                  hasFeedback
                >
                  <Input placeholder="Time Data Key" />
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
      /** The data key to pull the time from */
      timeDataKey: PropTypes.string,
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
