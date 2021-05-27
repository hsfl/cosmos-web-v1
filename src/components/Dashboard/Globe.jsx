import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Viewer, Entity, Model, Globe, Clock, CameraFlyTo, PathGraphics, GeoJsonDataSource, ImageryLayer,
  PolylineGraphics, PointGraphics,
} from 'resium';
import Cesium from 'cesium';

import {
  Form, Input, Collapse, Button, Switch, DatePicker, message,
} from 'antd';

import BaseComponent from '../BaseComponent';
import model from '../../public/cubesat.glb';
import { COSMOSAPI } from '../../api';
import { MJDtoJavaScriptDate, dateToMJD } from '../../utility/time';

import GlobeToolbar from './Globe/GlobeToolbar';

const { Panel } = Collapse;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

// Set Cesium Ion token only if it is defined in the .env file
if (process.env.CESIUM_ION_TOKEN) {
  Cesium.Ion.defaultAccessToken = process.env.CESIUM_ION_TOKEN;
}

const imageryProvider = new Cesium.ArcGisMapServerImageryProvider({
  url: '//services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer',
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
  const pos = Cesium.Cartesian3.fromArray([x, y, z]);

  return Cesium.Transforms.northUpEastToFixedFrame(pos);
}

/**
 * Parse latitude, longtiude, altitude to map Matrix 4x4
 * @param {Number} longitude degrees
 * @param {Number} latitude degrees
 * @param {Number} altitude meters
 */
function getPosFromSpherical(longitude, latitude, altitude) {
  const pos = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);

  return Cesium.Transforms.northUpEastToFixedFrame(pos);
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
}) {
  /** Accessing the neutron1 messages from the socket */
  const state = useSelector((s) => s.data);
  const realm = useSelector((s) => s.realm);

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
  const [start, setStart] = useState(Cesium.JulianDate.now);
  /** Clock end time */
  const [stop, setStop] = useState(null);
  /** Location for camera to fly to */
  const [cameraFlyTo, setCameraFlyTo] = useState(null);
  /** Variable to update to force component update */
  const [updateComponent, setUpdateComponent] = useState(false);
  /** State to store switch denoting whether added value is live or not */
  const [addOrbitLive, setAddOrbitLive] = useState(true);

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
      timeDataKey,
      live,
    }, i) => {
      if (state && realm && state[realm]
        && state[realm][XDataKey]
        && state[realm][YDataKey]
        && state[realm][ZDataKey]
        && (nodeProcess === 'any' || nodeProcess === [state[realm].node_name, state[realm].agent_name].join(':'))
        && ((!(process.env.FLIGHT_MODE === 'true') && state[realm].recorded_time)
        || (process.env.FLIGHT_MODE === 'true' && state[realm][timeDataKey]))
        && live
      ) {
        const tempOrbit = [...orbitsState];

        if (!tempOrbit[i].path) {
          tempOrbit[i].path = new Cesium.SampledPositionProperty();
        }

        let date;

        if (process.env.FLIGHT_MODE === 'true' && state[realm][timeDataKey]) {
          date = Cesium
            .JulianDate
            .fromDate(MJDtoJavaScriptDate(state[realm][timeDataKey]));
        } else {
          date = Cesium
            .JulianDate
            .fromDate(MJDtoJavaScriptDate(state[realm].recorded_time));
        }

        let pos;
        const x = typeof processXDataKey === 'function' ? processXDataKey(state[realm][XDataKey]) : state[realm][XDataKey];
        const y = typeof processYDataKey === 'function' ? processYDataKey(state[realm][YDataKey]) : state[realm][YDataKey];
        const z = typeof processZDataKey === 'function' ? processZDataKey(state[realm][ZDataKey]) : state[realm][ZDataKey];

        if (coordinateSystem === 'cartesian') {
          pos = Cesium
            .Cartesian3
            .fromArray(
              [
                x,
                y,
                z,
              ],
            );
          tempOrbit[i].path.addSample(date, pos);
          tempOrbit[i].position = [x, y, z];
          tempOrbit[i].posGeod = Cesium.Cartographic.fromCartesian(pos);
        }
        // else if (coordinateSystem === 'geodetic') {
        //   pos = Cesium.Cartesian3.fromDegrees(
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
        const targetPosLLA = { ...tempOrbit[0].posGeod, height: 0 };
        const targetPos = Object.values(
          Cesium.Cartesian3.fromRadians(...Object.values(targetPosLLA)),
        );
        if (!targetPos.includes(NaN)) {
          tempOrbit[i].targetPos = targetPos;
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
              startOrbit = Cesium
                .JulianDate
                .fromDate(MJDtoJavaScriptDate(data[0][timeDataKey]));

              stopOrbit = Cesium
                .JulianDate
                .fromDate(MJDtoJavaScriptDate(data[data.length - 1][timeDataKey]));

              const x = processXDataKey(data[0][dataKeys[0]]);
              const y = processYDataKey(data[0][dataKeys[1]]);
              const z = processZDataKey(data[0][dataKeys[2]]);

              startOrbitPosition = [x, y, z];
            }

            const sampledPosition = new Cesium.SampledPositionProperty();

            data.forEach((o) => {
              const x = processXDataKey(o[dataKeys[0]]);
              const y = processYDataKey(o[dataKeys[1]]);
              const z = processZDataKey(o[dataKeys[2]]);
              const p = [x, y, z];

              if (o[timeDataKey] && o[dataKeys[0]]) {
                const date = Cesium
                  .JulianDate
                  .fromDate(MJDtoJavaScriptDate(o[timeDataKey]));

                const pos = Cesium.Cartesian3.fromArray(p);

                sampledPosition.addSample(date, pos);
              }
            });

            tempOrbit[orbit].position = sampledPosition;

            setStart(startOrbit);
            setStop(stopOrbit);
            setOrbitsState(tempOrbit);

            setCameraFlyTo(Cesium.Cartesian3.fromArray([
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
        animation={false}
        baseLayerPicker={false}
        fullscreenButton={false}
        geocoder={false}
        homeButton={false}
        id="cesium-container-id"
        infoBox={false}
        navigationHelpButton={false}
        timeline={false}
      >
        <ImageryLayer imageryProvider={imageryProvider} />
        {overlaysState.map((overlay, i) => (
          <GeoJsonDataSource
            data={overlay.geoJson}
            fill={Cesium.Color.fromAlpha(Cesium.Color[overlay.color ? overlay.color.toUpperCase() : 'BLACK'], 0.2)}
            stroke={Cesium.Color[overlay.color ? overlay.color.toUpperCase() : 'BLACK']}
            // eslint-disable-next-line
            key={i}
          />
        ))}
        {
          /** Add attractor points */
          orbitsState.reduce((result, orbit) => {
            if (orbit.attrPointPos
              && orbit.position[0] !== orbit.position[1] && orbit.position[1] !== orbit.position[2]
            ) {
              result.push(
                <Entity
                  key={orbit.name}
                  position={Cesium.Cartesian3.fromArray(orbit.attrPointPos)}
                >
                  <PointGraphics
                    pixelSize={5}
                    color={Cesium.Color.WHITE}
                  />
                </Entity>
              );
            }
            return result;
          }, [])   
        }
        {
          /** Add line to target */
          orbitsState.reduce((result, orbit) => {
            if (orbit.targetting && orbit.targetPos
              && orbit.position[0] !== orbit.position[1] && orbit.position[1] !== orbit.position[2]
            ) {
              result.push(
                <Entity
                  key={orbit.name}
                >
                  <PolylineGraphics
                    positions={[
                      Cesium.Cartesian3.fromArray(orbit.position),
                      Cesium.Cartesian3.fromArray(orbit.targetPos),
                    ]}
                    width={2}
                    material={Cesium.Color.BLUE}
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
        />
        {/* <CzmlDataSource data={Attitude} /> */}
        {
          orbitsState.map((orbit) => {
            if (orbit.live) {
              return (
                <Entity
                  key={orbit.name}
                  position={orbit.path}
                >
                  <Model
                    modelMatrix={
                      coordinateSystem === 'cartesian'
                        ? getPos(orbit.position[0], orbit.position[1], orbit.position[2])
                        : getPosFromSpherical(
                          orbit.geodetic.longitude * (180 / Math.PI),
                          orbit.geodetic.latitude * (180 / Math.PI),
                          1000,
                        )
                    }
                    url={model}
                    minimumPixelSize={35}
                  />
                  <PathGraphics
                    width={3}
                    leadTime={86400}
                    trailTime={86400}
                    material={Cesium.Color.CHARTREUSE}
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
                >
                  <PathGraphics
                    width={3}
                    leadTime={600}
                    trailTime={600}
                    material={Cesium.Color.CRIMSON}
                  />
                </Entity>
              </span>
            );
          })
        }
        <GlobeToolbar orbitsState={orbitsState} />
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
                <td className="p-2 pr-8">{orbit.position[0]}</td>
                <td className="p-2 pr-8">{orbit.position[1]}</td>
                <td className="p-2 pr-8">{orbit.position[2]}</td>
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
};

CesiumGlobe.defaultProps = {
  name: '',
  orbits: [],
  overlays: [],
  showStatus: false,
  status: 'error',
  coordinateSystem: 'cartesian',
};

export default React.memo(CesiumGlobe);
