import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  Form, Input, Collapse,
} from 'antd';

import BaseComponent from '../BaseComponent';
import AttitudeThreeD from './Babylon/AttitudeThreeD';

const { Panel } = Collapse;

/**
 * Visualizes the attitude of an object through a Babylon.js simulation.
 * It contains a mesh sphere around a model of the satellite, along with XYZ axes.
 * On the bottom, it displays a table containing the current x, y, z and w vector values.
 */
function Attitude({
  name,
  attitudes,
  showStatus,
  status,
}) {
  /** Accessing the neutron1 messages from the socket */
  const state = useSelector((s) => s.data);

  /** Storage for form values */
  const [attitudesForm] = Form.useForm();
  /** Form for editing values */
  const [editForm] = Form.useForm();

  /** Initial form values for editForm */
  const [initialValues, setInitialValues] = useState({});
  /** The state that manages the component's title */
  const [nameState, setNameState] = useState(name);
  /** Currently displayed attitudes */
  const [attitudesState, setAttitudesState] = useState(attitudes);
  /** Variable to update to force component update */
  const [updateComponent, setUpdateComponent] = useState(false);

  /** Initialize form slots for each orbit */
  useEffect(() => {
    // Make an object for each plot's form
    let accumulate = {};

    // Initialize form values for each value
    attitudes.forEach(({
      name: nameVal, nodeProcess, dataKey: dataKeyVal, live,
    }, i) => {
      accumulate = {
        ...accumulate,
        [`name_${i}`]: nameVal,
        [`nodeProcess_${i}`]: nodeProcess,
        [`dataKey_${i}`]: dataKeyVal,
        [`live_${i}`]: live,
      };
    });

    setInitialValues(accumulate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Update the live attitude display */
  useEffect(() => {
    attitudesState.forEach(({ nodeProcess, dataKey, live }, i) => {
      if (state && state[nodeProcess]
        && state[nodeProcess][dataKey]
        && state[nodeProcess][dataKey].pos
        && live
      ) {
        const tempAttitude = [...attitudesState];

        tempAttitude[i].quaternions = state[nodeProcess][dataKey].pos;

        setAttitudesState(tempAttitude);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  /** Process edit value form */
  const processForm = (id) => {
    // Destructure form, field, index to retrieve changed field
    const [form, field, index] = id.split('_');

    // Check type of form
    if (form === 'orbitsForm') {
      // Update name state
      setNameState(attitudesForm.getFieldsValue()[field]);
    } else if (form === 'editForm') {
      // Create function for processDataKey, O.W. for inputs just set value
      attitudesForm[index][field] = editForm.getFieldsValue()[`${field}_${index}`];

      // Update state
      setUpdateComponent(!updateComponent);
    }
  };

  return (
    <BaseComponent
      name={nameState}
      subheader={attitudesState.length === 0 ? 'No orbits to display.' : null}
      liveOnly
      showStatus={showStatus}
      status={status}
      formItems={(
        <>
          <Form
            form={attitudesForm}
            layout="vertical"
            name="attitudesForm"
            initialValues={{
              name,
            }}
          >
            <Form.Item label="Name" name="name" hasFeedback>
              <Input onBlur={({ target: { id } }) => processForm(id)} />
            </Form.Item>
          </Form>
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
                attitudesState.map((attitude, i) => (
                  <Panel
                    header={(
                      <span className="text-gray-600">
                        <strong>
                          {attitude.nodeProcess}
                        </strong>
                      &nbsp;
                        <span>
                          {attitude.dataKey}
                        </span>
                      </span>
                    )}
                    key={`${attitude.name}${attitude.nodeProcess}${attitude.dataKey}`}
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
                  </Panel>
                ))
              }
            </Collapse>
          </Form>
        </>
      )}
    >
      <AttitudeThreeD
        data={attitudesState[0].quaternions}
      />
      <div className="overflow-x-auto">
        <table className="mt-4 w-full">
          <tbody>
            <tr className="bg-gray-200 border-b border-gray-400">
              <td className="p-2 pr-8">Name</td>
              <td className="p-2 pr-8">x</td>
              <td className="p-2 pr-8">y</td>
              <td className="p-2 pr-8">z</td>
              <td className="p-2 pr-8">w</td>
            </tr>
            {
            attitudesState.map((attitude) => (
              <tr className="text-gray-700 border-b border-gray-400" key={attitude.name}>
                <td className="p-2 pr-8">{attitude.name}</td>
                <td className="p-2 pr-8">{attitude.quaternions.d && attitude.quaternions.d.x ? attitude.quaternions.d.x : '-'}</td>
                <td className="p-2 pr-8">{attitude.quaternions.d && attitude.quaternions.d.y ? attitude.quaternions.d.y : '-'}</td>
                <td className="p-2 pr-8">{attitude.quaternions.d && attitude.quaternions.d.z ? attitude.quaternions.d.z : '-'}</td>
                <td className="p-2 pr-8">{attitude.quaternions.d && attitude.quaternions.w ? attitude.quaternions.w : '-'}</td>
              </tr>
            ))
          }
          </tbody>
        </table>
      </div>
    </BaseComponent>
  );
}

Attitude.propTypes = {
  /** Name of the component at the top */
  name: PropTypes.string,
  /** Currently displayed attitudes */
  attitudes: PropTypes.arrayOf(
    PropTypes.shape({
      /** Name of the attitude display */
      name: PropTypes.string,
      /** node:process to look at for retrieving attitude data */
      nodeProcess: PropTypes.string,
      /** Data key to retrieve data from */
      dataKey: PropTypes.string,
    }),
  ),
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
};

Attitude.defaultProps = {
  name: '',
  attitudes: [],
  showStatus: false,
  status: 'error',
};

export default React.memo(Attitude);
