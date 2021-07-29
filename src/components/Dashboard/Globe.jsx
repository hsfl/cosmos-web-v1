import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Viewer, Entity, Model, Globe, Clock, CameraFlyTo, PathGraphics, GeoJsonDataSource,
  PolylineGraphics, PointGraphics,
} from 'resium';
import {
  Cartesian3, Cartographic, ClockRange, Color, OpenStreetMapImageryProvider,
  JulianDate, PolylineArrowMaterialProperty, SampledPositionProperty,
  TimeInterval, TimeIntervalCollection, Transforms,
} from 'cesium';

import {
  Form, Input, Collapse, Button, Switch, DatePicker, message, Upload,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

import BaseComponent from '../BaseComponent';
import model from '../../public/cubesat.glb';
import { COSMOSAPI } from '../../api';
import { MJDtoJavaScriptDate, dateToMJD, iso8601ToUTC } from '../../utility/time';
import { parseDataKey } from '../../utility/data';
import createPaths from './Globe/GlobeCSV';
import { set } from '../../store/actions';

import GlobeToolbar from './Globe/GlobeToolbar';
import GlobeTimeline from './Globe/GlobeTimeline';

const { Panel } = Collapse;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const osm = new OpenStreetMapImageryProvider({
  url: 'https://a.tile.openstreetmap.org/',
});

const pixelSize = {
  pixelSize: 10,
};

/**
 * Convert from x, y, z to Matrix 4x4
 * @param {*} x meters
 * @param {*} y meters
 * @param {*} z meters
 */
function getPos(x, y, z) {
  const pos = Cartesian3.fromArray([x, y, z]);

  return Transforms.northUpEastToFixedFrame(pos);
}

/**
 * Parse latitude, longtiude, altitude to map Matrix 4x4
 * @param {Number} longitude degrees
 * @param {Number} latitude degrees
 * @param {Number} altitude meters
 */
function getPosFromSpherical(longitude, latitude, altitude) {
  const pos = Cartesian3.fromDegrees(longitude, latitude, altitude);

  return Transforms.northUpEastToFixedFrame(pos);
}

/**
 * Displays a globe with the orbit and orbit history using Resium (Cesium).
 * Retrieves location data and displays a model in the location.
 * Stores the location data and displays the path taken by the model.
 * Can overlay shapes over an area of the globe.
 * At the bottom, displays the current location.
 */
function CesiumGlobe({
  name,
  orbits,
  overlays,
  showStatus,
  status,
  coordinateSystem,
  simulationEnabled,
}) {
  /** Accessing the neutron1 messages from the socket */
  const state = useSelector((s) => s.data);
  const realm = useSelector((s) => s.realm);
  const simData = useSelector((s) => s.simData);
  const dispatch = useDispatch();

  /** Storage for global; form values */
  const [orbitsForm] = Form.useForm();
  /** Form for adding new values */
  const [newForm] = Form.useForm();
  /** Form for editing values */
  const [editForm] = Form.useForm();

  /** Initial form values for editForm */
  const [initialValues, setInitialValues] = useState({});
  /** The state that manages the component's title */
  const [nameState, setNameState] = useState(name);
  /** Storage for the current orbits being displayed */
  const [orbitsState, setOrbitsState] = useState(orbits);
  /** GeoJson objects */
  const [overlaysState] = useState(overlays);
  /** Store to retrieve orbit history by request from Mongo */
  const [retrieveOrbitHistory, setRetrieveOrbitHistory] = useState(null);
  /** Clock start time */
  const [start, setStart] = useState(JulianDate.now);
  /** Clock end time */
  const [stop, setStop] = useState(null);
  /** Location for camera to fly to */
  const [cameraFlyTo, setCameraFlyTo] = useState(null);
  /** Variable to update to force component update */
  const [updateComponent, setUpdateComponent] = useState(false);
  /** State to store switch denoting whether added value is live or not */
  const [addOrbitLive, setAddOrbitLive] = useState(true);
  /** Turn path visualization on or off */
  const [showPath, setShowPath] = useState(true);

  /** Initialize form slots for each orbit */
  useEffect(() => {
    // Make an object for each plot's form
    let accumulate = {};

    // Initialize form values for each value
    orbits.forEach(({
      name: nameVal,
      nodeProcess,
      XDataKey,
      YDataKey,
      ZDataKey,
      processXDataKey,
      processYDataKey,
      processZDataKey,
      VDataKey,
      ADataKey,
      timeDataKey,
      live,
    }, i) => {
      accumulate = {
        ...accumulate,
        [`name_${i}`]: nameVal,
        [`nodeProcess_${i}`]: nodeProcess,
        [`XDataKey_${i}`]: XDataKey,
        [`YDataKey_${i}`]: YDataKey,
        [`ZDataKey_${i}`]: ZDataKey,
        [`processXDataKey_${i}`]: processXDataKey
          ? processXDataKey.toString().replace(/^(.+\s?=>\s?)/, 'return ').replace(/^(\s*function\s*.*\([\s\S]*\)\s*{)([\s\S]*)(})/, '$2').trim()
          : 'return x',
        [`processYDataKey_${i}`]: processYDataKey
          ? processYDataKey.toString().replace(/^(.+\s?=>\s?)/, 'return ').replace(/^(\s*function\s*.*\([\s\S]*\)\s*{)([\s\S]*)(})/, '$2').trim()
          : 'return x',
        [`processZDataKey_${i}`]: processZDataKey
          ? processZDataKey.toString().replace(/^(.+\s?=>\s?)/, 'return ').replace(/^(\s*function\s*.*\([\s\S]*\)\s*{)([\s\S]*)(})/, '$2').trim()
          : 'return x',
        [`VDataKey_${i}`]: VDataKey,
        [`ADataKey_${i}`]: ADataKey,
        [`timeDataKey_${i}`]: timeDataKey || 'node_utc',
        [`live_${i}`]: live,
      };
    });

    setInitialValues(accumulate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Retrieve live orbit data */
  useEffect(() => {
    orbitsState.forEach(({
      nodeProcess,
      XDataKey,
      YDataKey,
      ZDataKey,
      processXDataKey,
      processYDataKey,
      processZDataKey,
      VDataKey,
      ADataKey,
      timeDataKey,
      live,
    }, i) => {
      if (state && realm && state[realm]
        && parseDataKey(XDataKey, state[realm])
        && parseDataKey(YDataKey, state[realm])
        && parseDataKey(ZDataKey, state[realm])
        && (nodeProcess === 'any' || nodeProcess === [state[realm].node_name, state[realm].agent_name].join(':'))
        && ((!(process.env.FLIGHT_MODE === 'true') && state[realm].recorded_time)
        || (process.env.FLIGHT_MODE === 'true' && state[realm][timeDataKey]))
        && live
      ) {
        const tempOrbit = [...orbitsState];

        if (!tempOrbit[i].path) {
          tempOrbit[i].path = new SampledPositionProperty();
        }

        let date;

        if (process.env.FLIGHT_MODE === 'true' && state[realm][timeDataKey]) {
          date = JulianDate
            .fromDate(MJDtoJavaScriptDate(state[realm][timeDataKey]));
        } else {
          date = JulianDate
            .fromDate(MJDtoJavaScriptDate(state[realm].recorded_time));
        }

        let pos;
        const x = typeof processXDataKey === 'function' ? processXDataKey(parseDataKey(XDataKey, state[realm])) : parseDataKey(XDataKey, state[realm]);
        const y = typeof processYDataKey === 'function' ? processYDataKey(parseDataKey(YDataKey, state[realm])) : parseDataKey(YDataKey, state[realm]);
        const z = typeof processZDataKey === 'function' ? processZDataKey(parseDataKey(ZDataKey, state[realm])) : parseDataKey(ZDataKey, state[realm]);

        if (coordinateSystem === 'cartesian') {
          pos = Cartesian3
            .fromArray(
              [
                x,
                y,
                z,
              ],
            );
          tempOrbit[i].path.addSample(date, pos);
          tempOrbit[i].position = pos;
          tempOrbit[i].posGeod = Cartographic.fromCartesian(pos);
        }
        // else if (coordinateSystem === 'geodetic') {
        //   pos = Cartesian3.fromDegrees(
        //     state[realm].target_loc_pos_geod_s_lat * (180 / Math.PI),
        //     state[realm].target_loc_pos_geod_s_lon * (180 / Math.PI),
        //     state[realm].target_loc_pos_geod_s_h,
        //   );
        // }

        if (coordinateSystem === 'geodetic'
          && state[realm].target_loc_pos_geod_s_lat
          && state[realm].target_loc_pos_geod_s_lon
          && state[realm].target_loc_pos_geod_s_h
        ) {
          tempOrbit[i].geodetic = {
            latitude: state[realm].target_loc_pos_geod_s_lat,
            longitude: state[realm].target_loc_pos_geod_s_lon,
            altitude: state[realm].target_loc_pos_geod_s_h,
          };
        }
        // temporary default targetting, to change later to some soh value
        const targetPosLLA = { longitude: 21.3069, latitude: 157.8583, height: 0 };
        const targetPos = Object.values(
          Cartesian3.fromDegrees(...Object.values(targetPosLLA)),
        );
        if (!targetPos.includes(NaN)) {
          tempOrbit[i].targetPos = targetPos;
        }

        // Velocity vector
        if (VDataKey !== undefined) {
          const vVector = parseDataKey(VDataKey, state[realm]);
          tempOrbit[i].vVector = Cartesian3.fromArray(vVector);
        }

        // Acceleration vector
        if (ADataKey !== undefined) {
          const aVector = parseDataKey(ADataKey, state[realm]);
          tempOrbit[i].aVector = Cartesian3.fromArray(aVector);
        }

        // Attractor points
        if (state[realm].sim_params !== undefined) {
          const attrPointPos = [
            state[realm].sim_params.x_attractor,
            state[realm].sim_params.y_attractor,
            state[realm].sim_params.z_attractor,
          ];
          tempOrbit[i].attrPointPos = attrPointPos;
        }

        setOrbitsState(tempOrbit);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  /** Load in simulation data from CSVs */
  useEffect(() => {
    if (simData !== null && simulationEnabled) {
      const paths = createPaths(simData);
      const tempOrbit = [...orbitsState];
      tempOrbit.forEach((o) => {
        const nodeIdx = simData.sats[o.nodeProcess];
        const oref = o;
        oref.live = false;
        oref.position = paths[nodeIdx];
      });
      const startOrbit = JulianDate.fromDate(MJDtoJavaScriptDate(simData.start));
      const stopOrbit = JulianDate.fromDate(MJDtoJavaScriptDate(simData.stop));
      setStart(startOrbit);
      setStop(stopOrbit);
      setOrbitsState(tempOrbit);
      // Reset state to null to allow for detection of future orbit history requests
      setRetrieveOrbitHistory(null);
    }
  }, [simData]);

  /**
  * Query database for historical data
  * @param {Array} dates length 2 array of dayjs or moments dates
  * @param {Array} dataKeys array of [xDataKey, yDataKey, zDataKey]
  * @param {Array} processDataKeys array of [processXDataKey, processYDataKey, processZDataKey]
  * @param {String} timeDataKey time data key to use to sort query
  * @param {String} nodeProcess name of the node
  * @param {Number} orbit node index
  */
  const queryHistoricalData = async (dates, dataKeys, processDataKeys,
    timeDataKey, nodeProcess, orbit) => {
    // Check to see if user chose a range of dates
    if (dates && dates.length === 2) {
      // Unix time to modified julian date
      const from = dateToMJD(dates[0]);
      const to = dateToMJD(dates[1]);

      try {
        const node = nodeProcess.split(':')[0];
        COSMOSAPI.querySOHData(node, {
          multiple: true,
          query: {
            [timeDataKey]: {
              $gt: from,
              $lt: to,
            },
          },
          options: {
            projection: {
              [dataKeys[0]]: 1,
              [dataKeys[1]]: 1,
              [dataKeys[2]]: 1,
              [timeDataKey]: 1,
            },
          },
          beginDate: from,
          endDate: to,
        }, (data) => {
          message.destroy();

          if (data.length === 0) {
            message.warning('No data for specified date range.');
          } else {
            message.success(`Retrieved ${data.length} records.`);

            const tempOrbit = [...orbitsState];

            let startOrbit;
            let stopOrbit;
            let startOrbitPosition;

            tempOrbit[orbit].live = false;

            const processXDataKey = new Function('x', processDataKeys[0]);
            const processYDataKey = new Function('x', processDataKeys[1]);
            const processZDataKey = new Function('x', processDataKeys[2]);

            if (data.length > 0) {
              startOrbit = JulianDate
                .fromDate(MJDtoJavaScriptDate(data[0][timeDataKey]));

              stopOrbit = JulianDate
                .fromDate(MJDtoJavaScriptDate(data[data.length - 1][timeDataKey]));

              const x = processXDataKey(data[0][dataKeys[0]]);
              const y = processYDataKey(data[0][dataKeys[1]]);
              const z = processZDataKey(data[0][dataKeys[2]]);

              startOrbitPosition = [x, y, z];
            }

            const sampledPosition = new SampledPositionProperty();

            data.forEach((o) => {
              const x = processXDataKey(o[dataKeys[0]]);
              const y = processYDataKey(o[dataKeys[1]]);
              const z = processZDataKey(o[dataKeys[2]]);
              const p = [x, y, z];

              if (o[timeDataKey] && o[dataKeys[0]]) {
                const date = JulianDate
                  .fromDate(MJDtoJavaScriptDate(o[timeDataKey]));

                const pos = Cartesian3.fromArray(p);

                sampledPosition.addSample(date, pos);
              }
            });

            tempOrbit[orbit].position = sampledPosition;

            setStart(startOrbit);
            setStop(stopOrbit);
            setOrbitsState(tempOrbit);

            setCameraFlyTo(Cartesian3.fromArray([
              startOrbitPosition[0] * 3,
              startOrbitPosition[1] * 3,
              startOrbitPosition[2] * 3,
            ]));
          }
        });
      } catch (error) {
        message.error(error.message);
      }
    }
  };

  /** Return whichever geodetic coordinates are defined */
  function GetGeodetic(orbit) {
    if (orbit.geodetic) {
      return orbit.geodetic;
    } if (orbit.posGeod) {
      return orbit.posGeod;
    }
    return 0;
  }

  /** Handle the collection of historical data */
  /** TODO: UPDATE RETRIEVAL FOR GEODETIC COORDINATES */
  useEffect(() => {
    if (retrieveOrbitHistory !== null) {
      const fields = editForm.getFieldsValue();
      const dates = fields[`dateRange_${retrieveOrbitHistory}`];
      const dataKeys = [fields[`XDataKey_${retrieveOrbitHistory}`], fields[`YDataKey_${retrieveOrbitHistory}`], fields[`ZDataKey_${retrieveOrbitHistory}`]];
      const processDataKeys = [fields[`processXDataKey_${retrieveOrbitHistory}`], fields[`processYDataKey_${retrieveOrbitHistory}`], fields[`processZDataKey_${retrieveOrbitHistory}`]];
      const timeDataKey = fields[`timeDataKey_${retrieveOrbitHistory}`];

      queryHistoricalData(
        dates,
        dataKeys,
        processDataKeys,
        timeDataKey,
        orbitsState[retrieveOrbitHistory].nodeProcess,
        retrieveOrbitHistory,
      );

      // Reset state to null to allow for detection of future orbit history requests
      setRetrieveOrbitHistory(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retrieveOrbitHistory]);

  /** Process rangepicker changes */
  const processRangePicker = (dateRange, elementName) => {
    // Destructure field and index for storage
    const [field, index] = elementName.split('_');
    orbitsState[index][field] = dateRange.map((date) => dateToMJD(date));
  };

  /** Process edit value form */
  const processForm = (id) => {
    // Destructure form, field, index to retrieve changed field
    const [form, field, index] = id.split('_');

    // Check type of form
    if (form === 'orbitsForm') {
      // Update name state
      setNameState(orbitsForm.getFieldsValue()[field]);
    } else if (form === 'editForm') {
      // Create function for processDataKey, O.W. for inputs just set value
      orbitsState[index][field] = editForm.getFieldsValue()[`${field}_${index}`];

      // Update state
      setUpdateComponent(!updateComponent);
    }
  };

  /** Process new value form */
  const onFinish = ({
    dateRange,
    name: nameVal,
    nodeProcess,
    XDataKey,
    YDataKey,
    ZDataKey,
    processXDataKey,
    processYDataKey,
    processZDataKey,
    VDataKey,
    ADataKey,
    live,
  }) => {
    // Append new value to array
    orbitsState.push({
      name: nameVal || '',
      nodeProcess,
      XDataKey,
      YDataKey,
      ZDataKey,
      processXDataKey,
      processYDataKey,
      processZDataKey,
      VDataKey,
      ADataKey,
      position: [0, 0, 0],
    });
    setUpdateComponent(!updateComponent);

    // Set edit value default form values
    const newIndex = orbitsState.length - 1;

    editForm.setFieldsValue({
      [`name_${newIndex}`]: nameVal,
      [`nodeProcess_${newIndex}`]: nodeProcess,
      [`XDataKey_${newIndex}`]: XDataKey,
      [`YDataKey_${newIndex}`]: YDataKey,
      [`ZDataKey_${newIndex}`]: ZDataKey,
      [`processXDataKey_${newIndex}`]: processXDataKey
        ? processXDataKey.toString().replace(/^(.+\s?=>\s?)/, 'return ').replace(/^(\s*function\s*.*\([\s\S]*\)\s*{)([\s\S]*)(})/, '$2').trim()
        : 'return x',
      [`processYDataKey_${newIndex}`]: processYDataKey
        ? processYDataKey.toString().replace(/^(.+\s?=>\s?)/, 'return ').replace(/^(\s*function\s*.*\([\s\S]*\)\s*{)([\s\S]*)(})/, '$2').trim()
        : 'return x',
      [`processZDataKey_${newIndex}`]: processZDataKey
        ? processZDataKey.toString().replace(/^(.+\s?=>\s?)/, 'return ').replace(/^(\s*function\s*.*\([\s\S]*\)\s*{)([\s\S]*)(})/, '$2').trim()
        : 'return x',
      [`VDataKey_${newIndex}`]: VDataKey,
      [`ADataKey_${newIndex}`]: ADataKey,
      [`live_${newIndex}`]: live,
      [`dateRange_${newIndex}`]: dateRange,
    });

    // Clear form
    newForm.resetFields();

    message.success('Created new orbit path.');

    if (!addOrbitLive) {
      setRetrieveOrbitHistory(newIndex);
    }
  };

  const scalePoints = (p1, p2) => {
    const dist = Cartesian3.distance(p1, p2);
    const vec = Cartesian3.subtract(p2, p1, new Cartesian3());
    const unitvec = Cartesian3.divideByScalar(vec, dist, new Cartesian3());
    const scaledVec = Cartesian3.multiplyByScalar(unitvec, 1000, new Cartesian3());
    const newPoint = Cartesian3.add(p1, scaledVec, new Cartesian3());
    return [p1, newPoint];
  };

  const calculatePointsFromPointAndVector = (p, v) => (
    [p, Cartesian3.add(p, v, new Cartesian3())]
  );

  const handleShowPathChange = (val) => (setShowPath(val));

  return (
    <BaseComponent
      name={nameState}
      subheader={orbitsState.length === 0 ? 'No orbits to display.' : null}
      liveOnly
      showStatus={showStatus}
      status={status}
      formItems={(
        <>
          <Form
            form={orbitsForm}
            layout="vertical"
            name="orbitsForm"
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
                orbitsState.map((orbit, i) => (
                  <Panel
                    header={(
                      <span className="text-gray-600">
                        <strong>
                          {orbit.nodeProcess}
                        </strong>
                      &nbsp;
                        <span>
                          {orbit.XDataKey}
                          ,&nbsp;
                          {orbit.YDataKey}
                          ,&nbsp;
                          {orbit.ZDataKey}
                        </span>
                      </span>
                    )}
                    key={`${orbit.name}${orbit.nodeProcess}${orbit.dataKey}`}
                    extra={(
                      <div
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={() => {}}
                        role="button"
                        tabIndex={-1}
                      >
                        <Form.Item name={`live_${i}`} noStyle>
                          <Switch
                            checkedChildren="Live"
                            unCheckedChildren="Past"
                            checked={orbit.live}
                            onChange={(checked) => {
                              orbitsState[i].live = checked;

                              setUpdateComponent(!updateComponent);
                            }}
                          />
                        </Form.Item>
                        &nbsp;
                        <span
                          onClick={(event) => {
                            event.stopPropagation();

                            setOrbitsState(orbitsState.filter((o, j) => j !== i));
                          }}
                          onKeyPress={() => {}}
                          role="button"
                          tabIndex={-2}
                        >
                          X
                        </span>
                      </div>
                    )}
                  >
                    <Form.Item label="Historical Date Range" name={`dateRange_${i}`} hasFeedback noStyle>
                      <RangePicker
                        className="mr-1"
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        disabled={editForm && editForm.getFieldsValue()[`live_${i}`]}
                        onChange={(id) => processRangePicker(id, `dateRange_${i}`)}
                      />
                    </Form.Item>

                    <Button
                      type="primary"
                      onClick={() => setRetrieveOrbitHistory(i)}
                      disabled={editForm && editForm.getFieldValue(`live_${i}`)}
                    >
                      Show
                    </Button>

                    <br />
                    <br />

                    <Form.Item label="Name" name={`name_${i}`} hasFeedback>
                      <Input placeholder="Name" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Node Process" name={`nodeProcess_${i}`} hasFeedback>
                      <Input placeholder="Node Process" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="X Data Key" name={`XDataKey_${i}`} hasFeedback>
                      <Input placeholder="X Data Key" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Y Data Key" name={`YDataKey_${i}`} hasFeedback>
                      <Input placeholder="Y Data Key" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Z Data Key" name={`ZDataKey_${i}`} hasFeedback>
                      <Input placeholder="ZData Key" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Process X Data Key" name={`processXDataKey_${i}`} hasFeedback>
                      <TextArea placeholder="Process X Data Key" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Process Y Data Key" name={`processYDataKey_${i}`} hasFeedback>
                      <TextArea placeholder="Process Y Data Key" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Process Z Data Key" name={`processZDataKey_${i}`} hasFeedback>
                      <TextArea placeholder="Process Z Data Key" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Time Data Key" name={`timeDataKey_${i}`} hasFeedback>
                      <Input placeholder="Time Data Key" onBlur={({ target: { id } }) => processForm(id)} />
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
              live: true,
            }}
          >
            <Collapse>
              <Panel header="Add Value" key="add">
                <Switch
                  checkedChildren="Live"
                  unCheckedChildren="Past"
                  checked={addOrbitLive}
                  onChange={() => setAddOrbitLive(!addOrbitLive)}
                />

                <br />
                <br />

                <Form.Item label="Historical Date Range" name="dateRange" hasFeedback>
                  <RangePicker
                    className="mr-1"
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    disabled={addOrbitLive}
                  />
                </Form.Item>

                <Form.Item label="Name" name="name" hasFeedback>
                  <Input placeholder="Name" />
                </Form.Item>

                <Form.Item label="Node Process" name="nodeProcess" hasFeedback>
                  <Input placeholder="Node Process" />
                </Form.Item>

                <Form.Item label="X Data Key" name="XdataKey" hasFeedback>
                  <Input placeholder="XData Key" />
                </Form.Item>

                <Form.Item label="Y Data Key" name="YDataKey" hasFeedback>
                  <Input placeholder="YData Key" />
                </Form.Item>

                <Form.Item label="Z Data Key" name="ZDataKey" hasFeedback>
                  <Input placeholder="ZData Key" />
                </Form.Item>

                <Form.Item label="Process X Data Key" name="processXDataKey" hasFeedback help="Define the function body (in JavaScript) here to process the variable 'x'.">
                  <TextArea placeholder="Process X Data Key" />
                </Form.Item>

                <Form.Item label="Process Y Data Key" name="processYDataKey" hasFeedback help="Define the function body (in JavaScript) here to process the variable 'x'.">
                  <TextArea placeholder="Process Y Data Key" />
                </Form.Item>

                <Form.Item label="Process Z Data Key" name="processZDataKey" hasFeedback help="Define the function body (in JavaScript) here to process the variable 'x'.">
                  <TextArea placeholder="Process Z Data Key" />
                </Form.Item>

                <Form.Item label="Time Data Key" name="timeDataKey" hasFeedback>
                  <Input placeholder="Time Data Key" />
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
      <Viewer
        baseLayerPicker={false}
        fullscreenButton={false}
        geocoder={false}
        homeButton={false}
        id="cesium-container-id"
        imageryProvider={osm}
        infoBox={false}
        navigationHelpButton={false}
      >
        {overlaysState.map((overlay, i) => (
          <GeoJsonDataSource
            data={overlay.geoJson}
            fill={Color.fromAlpha(Color[overlay.color ? overlay.color.toUpperCase() : 'BLACK'], 0.2)}
            stroke={Color[overlay.color ? overlay.color.toUpperCase() : 'BLACK']}
            // eslint-disable-next-line
            key={i}
          />
        ))}
        {
          /** Add attractor points */
          orbitsState.reduce((result, orbit) => {
            if (orbit.attrPointPos
              && orbit.position.x !== undefined
              && orbit.position.y !== undefined
              && orbit.position.z !== undefined
            ) {
              result.push(
                <Entity
                  key={orbit.name}
                  position={Cartesian3.fromArray(orbit.attrPointPos)}
                >
                  <PointGraphics
                    pixelSize={5}
                    color={Color.RED}
                  />
                </Entity>,
              );
            }
            return result;
          }, [])
        }
        {
          /** Add velocity vector */
          orbitsState.reduce((result, orbit) => {
            if (orbit.vVector !== undefined
              && orbit.position.x !== undefined
              && orbit.position.y !== undefined
              && orbit.position.z !== undefined
            ) {
              result.push(
                <Entity
                  key={orbit.name}
                >
                  <PolylineGraphics
                    positions={calculatePointsFromPointAndVector(
                      orbit.position,
                      orbit.vVector,
                    )}
                    width={2}
                    material={new PolylineArrowMaterialProperty(Color.GREEN)}
                    arcType="NONE"
                  />
                </Entity>,
              );
            }
            return result;
          }, [])
        }
        {
          /** Add acceleration vector */
          orbitsState.reduce((result, orbit) => {
            if (orbit.aVector !== undefined
              && orbit.position.x !== undefined
              && orbit.position.y !== undefined
              && orbit.position.z !== undefined
            ) {
              result.push(
                <Entity
                  key={orbit.name}
                >
                  <PolylineGraphics
                    positions={calculatePointsFromPointAndVector(
                      orbit.position,
                      orbit.aVector,
                    )}
                    width={2}
                    material={new PolylineArrowMaterialProperty(Color.RED)}
                    arcType="NONE"
                  />
                </Entity>,
              );
            }
            return result;
          }, [])
        }
        {
          /** Add line to target */
          orbitsState.reduce((result, orbit) => {
            if (orbit.targetting && orbit.targetPos
              && orbit.position.x !== undefined
              && orbit.position.y !== undefined
              && orbit.position.z !== undefined
            ) {
              result.push(
                <Entity
                  key={orbit.name}
                >
                  <PolylineGraphics
                    positions={scalePoints(
                      orbit.position,
                      Cartesian3.fromArray(orbit.targetPos),
                    )}
                    width={2}
                    material={new PolylineArrowMaterialProperty(Color.BLUE)}
                    arcType="NONE"
                  />
                </Entity>,
              );
            }
            return result;
          }, [])
        }
        <Globe enableLighting />
        <Clock
          startTime={start}
          stopTime={stop}
          currentTime={start}
          clockRange={start && stop ? ClockRange.LOOP_STOP : ClockRange.UNBOUNDED}
          onTick={(t) => {
            if (simulationEnabled) {
              dispatch(set('simClock', iso8601ToUTC(JulianDate.toDate(t.currentTime))));
            }
          }}
        />
        { simulationEnabled ? <GlobeTimeline start={start} stop={stop} /> : null }
        {/* <CzmlDataSource data={Attitude} /> */}
        {
          /** Model */
          orbitsState.map((orbit) => {
            if (orbit.position.x === undefined
              || orbit.position.y === undefined
              || orbit.position.z === undefined) {
              return null;
            }
            if (orbit.live) {
              return (
                <Entity
                  key={orbit.name}
                  position={orbit.position}
                  id={`${orbit.name}_model`}
                >
                  <Model
                    modelMatrix={
                      coordinateSystem === 'cartesian'
                        ? getPos(orbit.position.x, orbit.position.y, orbit.position.z)
                        : getPosFromSpherical(
                          orbit.geodetic.longitude * (180 / Math.PI),
                          orbit.geodetic.latitude * (180 / Math.PI),
                          1000,
                        )
                    }
                    url={model}
                    minimumPixelSize={35}
                  />
                </Entity>
              );
            }
            /** todo */
            return null;
          })
        }
        {
          /** Path */
          orbitsState.map((orbit) => {
            if (!showPath) {
            //  return null;
            }
            if (orbit.live) {
              return (
                <Entity
                  key={orbit.name}
                  position={orbit.path}
                  id={`${orbit.name}_path`}
                >
                  <PathGraphics
                    width={2}
                    leadTime={86400}
                    trailTime={86400}
                    material={Color.CHARTREUSE}
                  />
                </Entity>
              );
            }

            return (
              <span
                key={orbit.name}
              >
                {
                  cameraFlyTo ? <CameraFlyTo destination={cameraFlyTo} /> : null
                }
                <Entity
                  name={orbit.name}
                  position={orbit.position}
                  point={pixelSize}
                  availability={new TimeIntervalCollection([new TimeInterval({ start, stop })])}
                >
                  <PathGraphics
                    width={3}
                    leadTime={600}
                    trailTime={600}
                    material={Color.CRIMSON}
                  />
                </Entity>
              </span>
            );
          })
        }
        <GlobeToolbar orbitsState={orbitsState} handleShowPathChange={handleShowPathChange} />
      </Viewer>
      <div className="overflow-x-auto">
        <table className="mt-4 w-full">
          <tbody className="w-10">
            <tr className="bg-gray-200 border-b border-gray-400">
              <td className="p-2 pr-8">Name</td>
              <td className="p-2 pr-8">x (m)</td>
              <td className="p-2 pr-8">y (m)</td>
              <td className="p-2 pr-8">z (m)</td>
              <td className="p-2 pr-8">Latitude (rad)</td>
              <td className="p-2 pr-8">Longitude (rad)</td>
              <td className="p-2 pr-8">Altitude (m)</td>
            </tr>
            {
            orbitsState.map((orbit) => (
              <tr className="text-gray-700 border-b border-gray-400" key={orbit.name}>
                <td className="p-2 pr-8">{orbit.name}</td>
                <td className="p-2 pr-8">{orbit.position.x}</td>
                <td className="p-2 pr-8">{orbit.position.y}</td>
                <td className="p-2 pr-8">{orbit.position.z}</td>
                <td className="p-2 pr-8">{GetGeodetic(orbit) && GetGeodetic(orbit).latitude}</td>
                <td className="p-2 pr-8">{GetGeodetic(orbit) && GetGeodetic(orbit).longitude}</td>
                <td className="p-2 pr-8">{GetGeodetic(orbit) && GetGeodetic(orbit).height}</td>
              </tr>
            ))
          }
          </tbody>
        </table>
      </div>
    </BaseComponent>
  );
}

CesiumGlobe.propTypes = {
  /** Name of the component to display at the time */
  name: PropTypes.string,
  /** Default orbits to display */
  orbits: PropTypes.arrayOf(
    PropTypes.shape({
      /** Name of satellite */
      name: PropTypes.string,
      /** Model to use on globe */
      modelFileName: PropTypes.string,
      /** Node process to look at for xyz data */
      nodeProcess: PropTypes.string,
      /** Cartesian X value */
      XDataKey: PropTypes.string,
      /** Cartesian Y value */
      YDataKey: PropTypes.string,
      /** Cartesian Z value */
      ZDataKey: PropTypes.string,
      /** Process X function */
      processXDataKey: PropTypes.func,
      /** Process Y function */
      processYDataKey: PropTypes.func,
      /** Process Z function */
      processZDataKey: PropTypes.func,
      /** Velocity array of values */
      VDataKey: PropTypes.string,
      /** Acceleration array of values */
      ADataKey: PropTypes.string,
      /** Time data key to look at for data */
      timeDataKey: PropTypes.string,
      /** Whether or not the orbit is live */
      live: PropTypes.bool,
      /** Whether or not to enable targetting feature  */
      targetting: PropTypes.bool,
    }),
  ),
  /** Store overlays on map (geocoloring) */
  overlays: PropTypes.arrayOf(
    PropTypes.shape({
      /** Color of the overlay */
      color: PropTypes.string,
      /** GeoJSON code */
      geoJson: PropTypes.shape({}),
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
  /** Geodetic or cartesian */
  coordinateSystem: PropTypes.string,
  /** Whether to enable csv data loading for this instance */
  simulationEnabled: PropTypes.bool,
};

CesiumGlobe.defaultProps = {
  name: '',
  orbits: [],
  overlays: [],
  showStatus: false,
  status: 'error',
  coordinateSystem: 'cartesian',
  simulationEnabled: false,
};

export default React.memo(CesiumGlobe);
