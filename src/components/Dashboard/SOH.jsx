import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  Form, Select, DatePicker, message, Switch, Button,
} from 'antd';
import BaseComponent from '../BaseComponent';
import { axios } from '../../api';
import { mjdToUTCString, dateToMJD } from '../../utility/time';

const { RangePicker } = DatePicker;

/**
 * Displays a specified live value from an agent.
 * Updates values every agent heartbeat.
 */
function SOH({
  name,
  dateRange,
  height,
}) {
  /** Accessing the neutron1 messages from the socket */
  const state = useSelector((s) => s.data);
  const namespace = useSelector((s) => s.namespace);
  const realm = useSelector((s) => s.realm);

  /** Initialize settings */
  const [init, setInit] = useState(true);
  /** Form information */
  const [sohForm] = Form.useForm();
  /** The state that manages the component's title */
  const [nameState, setNameState] = useState(name);
  /** The date range of the database query */
  const [dates, setDates] = useState(dateRange);
  /** Stores active nodes */
  const [activeNodes, setActiveNodes] = useState([]);
  /** Stores active nodes */
  const [inactiveNodes, setInactiveNodes] = useState([]);
  /** Checks if the selected node is inactive or active */
  const [live, setLive] = useState(true);
  /** Allows the user to freeze the information from the state */
  const [stream, setStream] = useState(!!dates);

  /** Stores the overall SOH of the node process */
  const [soh, setSoh] = useState([]);
  /** Information displayed */
  const [display, setDisplay] = useState([]);

  /** Query database */
  const queryDatabase = async () => {
    message.loading('Retrieving information from database...', 0);

    const start = dateToMJD(dates[0]);
    const end = dateToMJD(dates[1]);

    const { data } = await axios.post(`/query/${realm}/${nameState}:soh`, {
      multiple: true,
      query: {
        node_utc: {
          $lt: end,
          $gt: start,
        },
      },
    });

    return data;
  };

  /**
   * Filters through JSON object and retrieves wanted key
   *
   * @param {*} input
   */
  const findSohProperty = (input) => {
    const tempObj = [];

    if (input.length !== 0) {
      soh.forEach((obj) => {
        const newObj = {
          localTime: mjdToUTCString(obj.node_utc),
        };

        input.forEach((item) => {
          newObj[item] = obj[item];
        });

        tempObj.push(newObj);
      });
    }

    setDisplay(tempObj);
  };

  const changeNode = (value) => {
    if (activeNodes.includes(value)) {
      setLive(true);
      setStream(true);
    }

    if (inactiveNodes.includes(value)) {
      setLive(false);
      setStream(false);
    }
  };

  /** Update the inactive and active node lists */
  useEffect(() => {
    /** Update active nodes */
    const activeArray = [];

    Object.keys(state).forEach((key) => {
      if (key.split(':')[1] === 'soh') {
        activeArray.push(key.split(':')[0]);
      }
    });

    setActiveNodes(activeArray);

    /** Update inactive nodes */
    if (Object.keys(state).includes('namespace')) {
      const inactiveArray = Object.keys(namespace)
        .filter((key) => !activeNodes.includes(key) && namespace[key].agents.includes('soh'));

      setInactiveNodes(inactiveArray);
    }

    /** Update SOH data */
    if (live && stream) {
      setSoh([state[`${nameState}:soh`]]);

      if (display.length !== 0) {
        findSohProperty(Object.keys(display[0]).slice(1));
      }
    }

    if (init) {
      setInit(false);
      changeNode(nameState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, namespace]);

  const processForm = async () => {
    setDisplay([]);

    const fields = sohForm.getFieldsValue();

    if (fields.name !== '') {
      setNameState(fields.name);
    }

    if (live) {
      setSoh(state[`${nameState}:soh`]);
    } else if (fields.dateRange != null) {
      try {
        setDates(fields.dateRange);

        const result = await queryDatabase();

        setSoh(result);

        message.destroy();

        if (result.length !== 0) {
          message.success(`Retrieved ${result.length} records.`);
        } else {
          message.warning('No data for specified range.');
        }
      } catch (err) {
        message.destroy();
        message.error('Error retrieving from database.');
      }
    } else {
      setSoh([]);
    }
  };

  return (
    <BaseComponent
      name={`${nameState} State of Health (SOH)`}
      subheader={(
        <Select
          className="w-full top-0"
          mode="multiple"
          showSearch
          allowClear
          placeholder="Select information you want to view"
          onChange={(input) => findSohProperty(input)}
        >
          {
            (soh != null && soh[0] != null && soh.length !== 0)
              ? Object.keys(soh[0]).map((props) => (
                <Select.Option
                  key={props}
                  value={props}
                >
                  {props}
                </Select.Option>
              ))
              : null
          }
        </Select>
      )}
      liveOnly
      showStatus
      height={height}
      status={state.length === 0 ? 'default' : 'success'}
      toolsSlot={(
        <Switch
          className="mr-1"
          checkedChildren="Stream"
          unCheckedChildren="Freeze"
          checked={stream}
          disabled={inactiveNodes.includes(nameState) && !live}
          onClick={() => setStream(!stream)}
        />
      )}
      formItems={(
        <>
          <Form
            form={sohForm}
            layout="vertical"
            name="sohForm"
            initialValues={{
              name: nameState,
              dateRange,

            }}
          >
            <Form.Item label="Name" name="name" hasFeedback>
              <Select
                showSearch
                onChange={(value) => changeNode(value)}
                onBlur={() => processForm()}
              >
                <Select.OptGroup label="Active">
                  {
                    activeNodes.map((node) => (
                      <Select.Option
                        key={node}
                        value={node}
                      >
                        {node}
                      </Select.Option>
                    ))
                  }
                </Select.OptGroup>
                <Select.OptGroup label="Inactive">
                  {
                    inactiveNodes.map((node) => (
                      <Select.Option
                        key={node}
                        value={node}
                      >
                        {node}
                      </Select.Option>
                    ))
                  }
                </Select.OptGroup>
              </Select>
            </Form.Item>
            <div className="mb-1 text-gray-800 mb-2">
              Historical Date Range
              <Switch
                className="ml-1"
                checkedChildren="Live"
                unCheckedChildren="Past"
                disabled={inactiveNodes.includes(nameState)}
                checked={live}
                onClick={() => {
                  setLive(!live);
                  setSoh([]);
                  setDisplay([]);
                }}
              />
            </div>
            <Form.Item label="Historical Date Range" name="dateRange" hasFeedback noStyle>
              <RangePicker
                className="mr-1"
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                disabled={live}
              />
            </Form.Item>
            <Button
              type="primary"
              onClick={() => processForm()}
              disabled={live}
            >
              Show
            </Button>
          </Form>
        </>
      )}
    >
      <pre className="pt-1">
        {
          Object.keys(display).length !== 0 ? JSON.stringify(display, null, 2)
            : JSON.stringify(soh, null, 2)
        }
      </pre>
    </BaseComponent>
  );
}

SOH.propTypes = {
  /** Name of the component to display at the time */
  name: PropTypes.string,
  dateRange: PropTypes.number,
  height: PropTypes.number.isRequired,
};

SOH.defaultProps = {
  name: '',
  dateRange: -1,
};

export default SOH;
