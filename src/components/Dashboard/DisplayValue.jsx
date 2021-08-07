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
import { MultiVarFx } from '../../utility/data';

/**
 * Displays a specified live value from an agent.
 * Updates values every agent heartbeat.
 */
function DisplayValue({
  name,
  displayValues,
  simulationEnabled,
  showPercentDifference,
}) {
  const dispatch = useDispatch();
  const queriedData = useSelector((s) => s.queriedData);
  const simData = useSelector((s) => s.simData);
  const simCurrentIdx = useSelector((s) => s.simCurrentIdx);

  /** Accessing the neutron1 messages from the socket */
  const state = useSelector((s) => s.data);
  const realm = useSelector((s) => s.realm);

  /** Storage for global form values */
  const [displayValuesForm] = Form.useForm();

  /** The state that manages the component's title */
  const [nameState, setNameState] = useState(name);

  /** Store the display values here */
  const [displayValuesState, setDisplayValuesState] = useState(displayValues);
  /** Variable to update to force component update */
  const [updateComponent, setUpdateComponent] = useState(false);
  /** Whether to display live values from soh */
  const [live, setLive] = useState(true);

  /** Handle new data incoming from the Context */
  useEffect(() => {
    // Loop through the currently displayed values
    displayValuesState.forEach((v, i) => {
      // Check if the state change involves any of the displayed values
      // by checking the node process and the key it is watching
      if (state && realm && state[realm]
        && state[realm][v.dataKey] !== undefined
        && (v.nodeProcess === 'any' || v.nodeProcess === [state[realm].node_name, state[realm].agent_name].join(':')
        || v.node === state[realm].node_name)
        && ((!(process.env.FLIGHT_MODE === 'true') && state[realm].recorded_time)
        || (process.env.FLIGHT_MODE === 'true' && state[realm][v.timeDataKey]))
        && live
      ) {
        const data = state[realm][v.dataKey];
        const value = v.processDataKey(data);

        // If it does, change the value
        displayValuesState[i].value = value;

        // Process converted raw value
        if (v.processSecondaryData) {
          displayValuesState[i].secondaryDataKey = v.processSecondaryData(data);
        }

        // Handle percent difference
        const castedValue = Number(value);

        if (typeof castedValue === 'number') {
          const { previousValue } = v;

          // Prevent 0/0 case
          if (data !== previousValue) {
            // Calculate percent difference
            displayValuesState[i].percentDifference = previousValue !== undefined
              ? (((castedValue - previousValue) / ((castedValue + previousValue) / 2)) * 100)
              : undefined;
          } else {
            displayValuesState[i].percentDifference = 0;
          }

          // Set previous value for next % diff calculation
          displayValuesState[i].previousValue = castedValue;
        }

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

  // Switch to simulation mode and grab values from simData
  useEffect(() => {
    if (simData !== null) {
      setLive(false);
    }
  }, [simData]);
  useEffect(() => {
    if (simulationEnabled && simData !== null && simCurrentIdx !== null) {
      displayValuesState.forEach((v) => {
        const vref = v;
        const idx = simCurrentIdx >= simData.data[simData.sats[vref.nodeProcess]].length
          ? simData.data[simData.sats[vref.nodeProcess]].length - 1
          : simCurrentIdx;
        let dataKeyIdxs;
        if (Array.isArray(vref.dataKey)) {
          dataKeyIdxs = vref.dataKey.map((dkey) => simData.nameIdx[dkey]);
        } else {
          dataKeyIdxs = simData.nameIdx[vref.dataKey];
        }
        const value = v.processDataKey
          ? MultiVarFx(
            dataKeyIdxs,
            vref.processDataKey,
            simData.data[simData.sats[vref.nodeProcess]][idx],
          )
          : simData.data[simData.sats[vref.nodeProcess]][idx][dataKeyIdxs];
        vref.value = value;
        vref.time = mjdToUTCString(
          simData.data[simData.sats[vref.nodeProcess]][idx][simData.nameIdx[vref.timeDataKey]],
        );

        if (vref.dataKeyLowerThreshold
          && value <= vref.dataKeyLowerThreshold
        ) {
          dispatch(setActivity({
            status: 'error',
            summary: `${value} ≤ ${vref.dataKeyLowerThreshold} ${vref.unit}`,
            scope: `for ${vref.name}`,
          }));
        }

        if (vref.dataKeyUpperThreshold
          && value >= vref.dataKeyUpperThreshold
        ) {
          dispatch(setActivity({
            status: 'error',
            summary: `${value} ≥ ${vref.dataKeyUpperThreshold} ${vref.unit}`,
            scope: `for ${vref.name}`,
          }));
        }
      });
      // I hate how hacky this is, change to reducer later
      setDisplayValuesState((s) => [...s]);
    }
  }, [simData, simCurrentIdx, simulationEnabled, dispatch]);

  useEffect(() => {
    if (queriedData) {
      displayValuesState.forEach((
        {
          dataKey, timeDataKey, processDataKey, processSecondaryData,
        },
        i,
      ) => {
        if (queriedData[dataKey]) {
          if (queriedData[dataKey].length === 0 || queriedData[timeDataKey].length === 0) {
            message.warning(`No data for specified date range in for ${dataKey}/${timeDataKey}.`);
          } else {
            message.success(`Retrieved ${queriedData[dataKey].length} records in ${dataKey}/${timeDataKey}.`);

            const lastValue = queriedData[dataKey][queriedData[dataKey].length - 1];
            const lastTimeValue = queriedData[timeDataKey][queriedData[timeDataKey].length - 1];

            displayValuesState[i].value = processDataKey ? processDataKey(lastValue) : lastValue;

            if (processSecondaryData) {
              displayValuesState[i].secondaryDataKey = processSecondaryData(lastValue);
            }

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
        showPercentDifference={showPercentDifference}
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
      /** the node:process to pull the value from */
      node: PropTypes.string,
      /** The data key to pull the value from */
      dataKey: PropTypes.any,
      /** Emit warning if data key exceeds threshold */
      dataKeyUpperThreshold: PropTypes.number,
      /** Emit warning if data key is below threshold */
      dataKeyLowerThreshold: PropTypes.number,
      /** The data key to pull the time from */
      timeDataKey: PropTypes.string,
      /** The function to put the value through to manipulate it */
      processDataKey: PropTypes.func,
      /** Provide option to show a secondary value */
      processSecondaryDataKey: PropTypes.func,
      /** The unit of the  */
      unit: PropTypes.string,
    }),
  ),
  // Whether to allow CSV data loading
  simulationEnabled: PropTypes.bool,
  // Show percentDifference?
  showPercentDifference: PropTypes.bool,
};

DisplayValue.defaultProps = {
  name: '',
  displayValues: [],
  simulationEnabled: false,
  showPercentDifference: true,
};

export default React.memo(DisplayValue);
