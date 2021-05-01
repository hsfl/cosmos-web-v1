import React, {
  useState, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  Form, Input, Button, Select, message, Card, Switch,
} from 'antd';

import BaseComponent from '../BaseComponent';
import { COSMOSAPI } from '../../api';

const minWidth = {
  minWidth: '5em',
};
/**
 * Component to conveniently get and set values via an agent command.
 */
function SetValues({
  name,
  subheader,
  liveOnly,
  showStatus,
  status,
  formItems,
  values,
  node,
  proc,
}) {
  const macro = useSelector((s) => s.macro);

  /** Form storage */
  const [form, setForm] = useState({});
  /** Status of the live switch */
  const [, setLiveSwitch] = useState();
  /** Store the previously send commands and their outputs */
  const [commandHistory, setCommandHistory] = useState([]);
  /** The currently selected component to change */
  const [selectedComponent, setSelectedComponent] = useState(Object.keys(values)[0]);
  /** The currently selected property to change */
  const [selectedProperty, setSelectedProperty] = useState(values[Object.keys(values)[0]][0]);
  /** The live values to display from the agent */
  const [liveValues, setLiveValues] = useState([]);
  /** Auto scroll the history log to the bottom */
  const [updateLog, setUpdateLog] = useState(null);
  /** Values to query */
  const [queryValues, setQueryValues] = useState(null);
  /** State for switch */
  const [dopplerSwitch, setDopplerSwitch] = useState(0);

  /** DOM element selector for history log */
  const cliEl = useRef(null);

  /** Send the agent command with the selected value to change. */
  const setParameter = async () => {
    try {
      // Error handlers
      if (!selectedComponent) {
        throw new Error('A component is required.');
      }

      if (!selectedProperty) {
        throw new Error('A property is required.');
      }

      if (!form.value || form.value === '') {
        throw new Error('A value is required.');
      }

      // Specify added value
      setCommandHistory([
        ...commandHistory,
        `➜ agent ${node} ${proc} ${selectedComponent === 'USRP_UHD_Device' || selectedComponent === 'USRP_Device_Tx' || selectedComponent === 'USRP_Device_Rx' ? 'configure_device' : 'app_configure_component'} ${macro ? `${macro} ` : ''}${selectedComponent} ${selectedProperty} ${form.value}`,
      ]);

      setUpdateLog(true);

      await COSMOSAPI.runAgentCommand(node, proc,`${selectedComponent === 'USRP_UHD_Device' || selectedComponent === 'USRP_Device_Tx' || selectedComponent === 'USRP_Device_Rx' ? 'configure_device' : 'app_configure_component'} ${macro ? `${macro} ` : ''}${selectedComponent} ${selectedProperty} ${form.value}`,
      (data) => {
        setCommandHistory([
          ...commandHistory,
          data,
        ]);
      });

      setUpdateLog(true);

      setForm({
        ...form,
        value: '',
        success: true,
      });
    } catch (error) {
      setForm({
        ...form,
        success: false,
      });

      message.error(error.message);
    }
  };

  useEffect(() => {
    async function switchDoppler() {
      try {
        setCommandHistory([
          ...commandHistory,
          `➜ agent ${node} ${proc} doppler ${dopplerSwitch}`,
        ]);

        await COSMOSAPI.runAgentCommand(node, proc ,`doppler ${dopplerSwitch}`,
          (data) => {
            setCommandHistory([
              ...commandHistory,
              data,
            ]);
        });

        setUpdateLog(true);
      } catch (error) {
        message.error(error.message);
      }
    }

    switchDoppler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dopplerSwitch]);

  /** Get the live values from the agent */
  const getValue = async () => {
    try {
      await COSMOSAPI.runAgentCommand(node, proc, `${selectedComponent === 'USRP_UHD_Device' || selectedComponent === 'USRP_Device_Tx' || selectedComponent === 'USRP_Device_Rx' ? 'device_properties' : 'app_component'} ${macro && !(selectedComponent === 'USRP_UHD_Device' || selectedComponent === 'USRP_Device_Tx' || selectedComponent === 'USRP_Device_Rx') ? `${macro} ` : ''}${selectedComponent}`,
      (data) => {
        const json = JSON.parse(data);

        if (json.output && json.output.properties) {
          setLiveValues(json.output.properties);
        } else if (json.output && json.output.error) {
          setLiveValues([{ id: json.output.error }]);
        }
      });
    } catch (error) {
      setLiveValues([{ id: 'Unable to retrieve component properties.' }]);

      message.error(error.message);
    }
  };

  /** Poll every second for the values */
  useEffect(() => {
    getValue();

    setQueryValues(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryValues]);

  /** Update height of the history log to bottom of window */
  useEffect(() => {
    cliEl.current.scrollTop = cliEl.current.scrollHeight;
    setUpdateLog(null);
  }, [updateLog]);

  return (
    <BaseComponent
      name={name}
      subheader={subheader}
      liveOnly={liveOnly}
      showStatus={showStatus}
      status={status}
      formItems={formItems}
      handleLiveSwitchChange={(checked) => setLiveSwitch(checked)}
    >
      Doppler On / Doppler Off
      <Switch
        className="ml-2 mr-2"
        checkedChildren="1"
        unCheckedChildren="0"
        onChange={(checked) => (checked ? setDopplerSwitch(1) : setDopplerSwitch(0))}
      />
      <br />
      <br />
      <div
        className="border border-gray-300 rounded mb-2 p-4 bg-white font-mono h-32 max-h-full resize-y overflow-y-auto"
        ref={cliEl}
      >
        {
          // eslint-disable-next-line
          commandHistory.map((command, i) => (<div key={`${command}${i}`}>{ command }</div>))
        }
      </div>
      <Form layout="vertical">
        <div className="flex w-full flex-wrap">
          <div className="flex-initial flex-grow pr-2">
            <Form.Item
              hasFeedback={form.value}
              validateStatus={form.value && form.success ? 'success' : ''}
              className="-mb-1"
            >
              <Input
                addonBefore={(
                  <Input.Group compact>
                    <Select
                      showSearch
                      defaultValue={selectedComponent}
                      dropdownMatchSelectWidth={false}
                      onChange={(value) => {
                        setSelectedComponent(value);
                        setSelectedProperty(values[value][0]);
                      }}
                      style={minWidth}
                    >
                      {
                        Object.keys(values).map((value) => (
                          <Select.Option
                            key={value}
                            value={value}
                          >
                            {value}
                          </Select.Option>
                        ))
                      }
                    </Select>
                    &nbsp;&nbsp;&nbsp;
                    <Select
                      showSearch
                      value={selectedProperty}
                      dropdownMatchSelectWidth={false}
                      onChange={(value) => setSelectedProperty(value)}
                      style={minWidth}
                    >
                      {
                        values[selectedComponent].map((property) => (
                          <Select.Option
                            key={property}
                            value={property}
                          >
                            {property}
                          </Select.Option>
                        ))
                      }
                    </Select>
                  </Input.Group>
                )}
                placeholder="Value"
                id="value"
                onChange={({ target: { value } }) => {
                  setForm({
                    ...form,
                    value,
                  });
                }}
                value={form.value}
                onPressEnter={() => setParameter()}
              />
            </Form.Item>
          </div>

          <Button
            type="danger"
            onClick={() => setParameter()}
          >
            Set Value
          </Button>
        </div>
      </Form>

      <Card className="my-1">
        <Button
          onClick={() => setQueryValues(true)}
        >
          Query Properties
        </Button>
        <br />
        <br />
        <table>
          <tbody>
            {
              liveValues.map(({ id, type, value }) => (
                <>
                  {
                    type === 'sequence'
                      ? value.map((val) => (
                        <tr key={`${id}${val.id}`}>
                          <td className="pr-2">
                            {id}
                            :
                            {val.id}
                          </td>
                          <td className="text-gray-500">
                            {val.value}
                          </td>
                        </tr>
                      ))
                      : (
                        <tr key={id}>
                          <td className="pr-2">
                            {id}
                          </td>
                          <td className="text-gray-500">
                            {value}
                          </td>
                        </tr>
                      )
                  }
                </>
              ))
            }
          </tbody>
        </table>
      </Card>
    </BaseComponent>
  );
}

SetValues.propTypes = {
  /** Name of the component to display at the time */
  name: PropTypes.string,
  /** Supplementary information below the name */
  subheader: PropTypes.string,
  /** Whether the component can display only live data. Hides/shows the live/past switch. */
  liveOnly: PropTypes.bool,
  /** Whether to show a circular indicator of the status of the component */
  showStatus: PropTypes.bool,
  /** The type of badge to show if showStatus is true (see the ant design badges component) */
  status: ({ showStatus }, propName, componentName) => {
    if (showStatus) {
      return new Error(
        `${propName} is required when showStatus is true in ${componentName}.`,
      );
    }

    return null;
  },
  /** Form node */
  formItems: PropTypes.node,
  /** Values to change */
  values: PropTypes.shape({}).isRequired,
  /** The node of the agent to set the values */
  node: PropTypes.string.isRequired,
  /** The process of the agent to set the values */
  proc: PropTypes.string.isRequired,
};

SetValues.defaultProps = {
  name: '',
  subheader: null,
  showStatus: false,
  liveOnly: true,
  status: 'error',
  formItems: null,
};

export default SetValues;
