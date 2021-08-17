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
  simulationEnabled,
}) {
  /** Accessing the neutron1 messages from the socket */
  const state = useSelector((s) => s.data);
  const realm = useSelector((s) => s.realm);
  const simData = useSelector((s) => s.simData);
  const simCurrentIdx = useSelector((s) => s.simCurrentIdx);

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
  /** Use live values from context soh */
  // const [live, setLive] = useState(true);

  /** Initialize form slots for each orbit */
  useEffect(() => {
    // Make an object for each plot's form
    let accumulate = {};

    // Initialize form values for each value
    attitudes.forEach(({
      name: nameVal, nodeProcess, posDataKeys: dataKeyVal, live,
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
    attitudesState.forEach(({
      nodeProcess,
      posDataKeys,
      live,
    }, i) => {
      const [nodeName, agentName] = nodeProcess.split(':');
      if (state && realm && state[realm]
        && (state[realm].node_name && nodeName === state[realm].node_name)
        && (state[realm].agent_name && agentName === state[realm].agent_name)
        && state[realm][posDataKeys]
        && (state[realm][posDataKeys].s || state[realm][posDataKeys].pos)
        && live
      ) {
        const tempAttitude = [...attitudesState];

        // Support both namespace 1.0 and 2.0 for now
        tempAttitude[i].quaternions = state[realm][posDataKeys].s
          ? state[realm][posDataKeys].s
          : state[realm][posDataKeys].pos;

        setAttitudesState(tempAttitude);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Use CSV Data
  useEffect(() => {
    /** Convert a vector into a unit vector */
    const toUnitVector = (vec, posDataKeys, dataRow) => {
      const fromOrigin = vec.from === 'origin';
      const toOrigin = vec.to === 'origin';
      const x1 = fromOrigin ? 0 : dataRow[simData.nameIdx[posDataKeys[vec.from][0]]];
      const y1 = fromOrigin ? 0 : dataRow[simData.nameIdx[posDataKeys[vec.from][1]]];
      const z1 = fromOrigin ? 0 : dataRow[simData.nameIdx[posDataKeys[vec.from][2]]];
      const x2 = toOrigin ? 0 : dataRow[simData.nameIdx[posDataKeys[vec.to][0]]];
      const y2 = toOrigin ? 0 : dataRow[simData.nameIdx[posDataKeys[vec.to][1]]];
      const z2 = toOrigin ? 0 : dataRow[simData.nameIdx[posDataKeys[vec.to][2]]];
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dz = z2 - z1;
      const norm = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
      return [dx / norm, dy / norm, dz / norm];
    };
    if (simulationEnabled && simData !== null && simCurrentIdx !== null) {
      attitudesState.forEach(({
        nodeProcess,
        vectors,
        posDataKeys,
        quaternionDataKeys,
      }, i) => {
        const tempAttitude = [...attitudesState];
        const idx = simCurrentIdx >= simData.data[simData.sats[nodeProcess]].length
          ? simData.data[simData.sats[nodeProcess]].length - 1
          : simCurrentIdx;
        // Support only separate keys for now. TODO: add generic support later
        // For every vector defined in vectors,
        // create a unit vector and save the quaternion to rotate it with
        const dataRow = simData.data[simData.sats[nodeProcess]][idx];
        const unitVectors = [];
        vectors.forEach((v) => {
          const unitVector = toUnitVector(v, posDataKeys, dataRow);
          const unitVectorEntry = { vector: unitVector, quaternion: v.quaternion };
          unitVectors.push(unitVectorEntry);
        });
        tempAttitude[i].unitVectors = unitVectors;
        // For every rotation quaternion defined in quaternionDataKeys, retrieve its values
        const quaternions = {};
        Object.entries(quaternionDataKeys).forEach(([key, v]) => {
          const qx = dataRow[simData.nameIdx[v[0]]];
          const qy = dataRow[simData.nameIdx[v[1]]];
          const qz = dataRow[simData.nameIdx[v[2]]];
          const qw = dataRow[simData.nameIdx[v[3]]];
          quaternions[key] = { d: { x: qx, y: qy, z: qz }, w: qw };
        });
        tempAttitude[i].quaternions = quaternions;
        setAttitudesState(tempAttitude);
      });
    }
  }, [simData, simCurrentIdx, simulationEnabled]);

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
                          {attitude.posDataKeys}
                        </span>
                      </span>
                    )}
                    key={`${attitude.name}${attitude.nodeProcess}${attitude.posDataKeys}`}
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
        vectors={attitudesState[0].unitVectors}
        quaternions={attitudesState[0].quaternions}
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
                <td className="p-2 pr-8">{attitude.quaternions.d && (attitude.quaternions.d.x || attitude.quaternions.d.x === 0) ? attitude.quaternions.d.x : '-'}</td>
                <td className="p-2 pr-8">{attitude.quaternions.d && (attitude.quaternions.d.y || attitude.quaternions.d.y === 0) ? attitude.quaternions.d.y : '-'}</td>
                <td className="p-2 pr-8">{attitude.quaternions.d && (attitude.quaternions.d.z || attitude.quaternions.d.z === 0) ? attitude.quaternions.d.z : '-'}</td>
                <td className="p-2 pr-8">{attitude.quaternions.d && (attitude.quaternions.w || attitude.quaternions.w === 0) ? attitude.quaternions.w : '-'}</td>
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
      /** node name to look at for retrieving attitude data */
      nodeProcess: PropTypes.string,
      /** Array of dicts defining vector from to, and using which quaternion to rotate */
      vectors: PropTypes.arrayOf(PropTypes.shape({
        from: PropTypes.string,
        to: PropTypes.string,
        sat: PropTypes.string,
      })),
      /** Data key for position elements (eg: sat xyz) */
      posDataKeys: PropTypes.any,
      /** Data keys for rotation quaternions (eg: sat eci<->body frame rotation quaternion) */
      quaternionDataKeys: PropTypes.any,
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
  /** Enable CSV Data loading */
  simulationEnabled: PropTypes.bool,
};

Attitude.defaultProps = {
  name: '',
  attitudes: [],
  showStatus: false,
  status: 'error',
  simulationEnabled: false,
};

export default React.memo(Attitude);
