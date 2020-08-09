import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import {
  Form, Input, message,
} from 'antd';

import BaseComponent from '../BaseComponent';
import DisplayValuesTable from './DisplayValues/DisplayValuesTable';

import { setActivity, incrementQueue } from '../../store/actions';
import { mjdToUTCString } from '../../utility/time';

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

  /** The state that manages the component's title */
  const [nameState, setNameState] = useState(name);

  /** Store the display values here */
  const [displayValuesState] = useState(displayValues);
  /** Variable to update to force component update */
  const [updateComponent, setUpdateComponent] = useState(false);

  /** Handle new data incoming from the Context */
  useEffect(() => {
    // Loop through the currently displayed values
    displayValuesState.forEach((v, i) => {
      // Check if the state change involves any of the displayed values
      // by checking the node process and the key it is watching
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
  }, [displayValues.map((v) => state[v.dataKey])]);

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
            displayValuesState[i].time = mjdToUTCString(lastTimeValue);
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
    const [form, field] = id.split('_');

    // Check type of form
    if (form === 'displayValuesForm') {
      switch (field) {
        case 'name':
          // Update name state
          setNameState(displayValuesForm.getFieldsValue()[field]);
          break;
        default:
          break;
      }
    }
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
            }}
          >
            <Form.Item label="Name" name="name" hasFeedback>
              <Input onBlur={({ target: { id } }) => processForm(id)} />
            </Form.Item>
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
