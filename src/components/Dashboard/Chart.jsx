import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import {
  Form,
  Input,
  InputNumber,
  Button,
  Switch,
  Select,
  message,
  Tag,
  Popconfirm,
} from 'antd';
import {
  ExclamationCircleOutlined,
  DownloadOutlined,
  ClearOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import Plot from 'react-plotly.js';
import { saveAs } from 'file-saver';
import { useSelector, useDispatch } from 'react-redux';
import { determineLayout, returnDefaultYAxisRange } from '../../utility/chart';
import { incrementQueue } from '../../store/actions';

import BaseComponent from '../BaseComponent';
import ChartValues from './Chart/ChartValues';

import { mjdToUTCString, dateToMJD } from '../../utility/time';

/**
 * Display data on a chart using plot.ly. Allows for various plot.ly configurations.
 * On the top bar, it displays the data that is currently being displayed on the chart.
 * It allows for custom configuration such as the chart name,
 * data limit amount and the data key to display on the x axis.
 */
function Chart({
  name,
  defaultYAxis,
  dataLimit,
  plots,
  showZero,
  polar,
  children,
}) {
  const dispatch = useDispatch();

  /** Accessing the neutron1 node process context and drilling down */
  const state = useSelector((s) => s.data);
  // const globalHistoricalDate = useSelector((s) => s.globalHistoricalDate);
  // const globalQueue = useSelector((s) => s.globalQueue);
  const realm = useSelector((s) => s.realm);
  const queriedData = useSelector((s) => s.queriedData);
  // const currentTab = useSelector((s) => s.tab);

  /** Storage for global form values */
  const [plotsForm] = Form.useForm();
  /** Form for editing values */
  const [editForm] = Form.useForm();

  /** The state that manages the component's title */
  const [nameState, setNameState] = useState(name);
  /** Specify a limit on the number of data poitns displayed */
  const [dataLimitState, setDataLimitState] = useState(dataLimit);
  /** Counter determining when the plot should be updated */
  const [dataRevision, setDataRevision] = useState(0);
  /** Layout parameters for the plot */
  const [layout, setLayout] = useState(determineLayout(defaultYAxis, dataRevision));
  /** Plot data storage */
  const [plotsState, setPlotsState] = useState(plots);
  /** Variable to update to force component update */
  const [updateComponent, setUpdateComponent] = useState(false);

  /**
   * Use object with keyed time
   * Nested object with key y and value x
   */
  const downloadDataAsCSV = () => {
    const xValues = {}; // to store keyed values
    const yValues = []; // to store dates

    // Get possible y values
    plotsState.forEach((plot) => {
      plot.x.forEach((x, i) => {
        xValues[x] = {
          ...xValues[x],
          [plot.YDataKey]: plot.y[i],
        };
      });

      yValues.push(plot.YDataKey);
    });

    // Sort according to date
    const sortedKeys = Object.keys(xValues).sort();

    // Convert each date object to array
    sortedKeys.forEach((key) => {
      // Save values
      const values = xValues[key];

      // Convert to array without value keys
      xValues[key] = Object.entries(values).map(([, value]) => value);
    });

    // Create blob to download file
    const blob = new Blob(
      [
        [
          ['mjd', 'time', ...yValues].join(','), // columns
          Object.entries(xValues).map(([key, value]) => [dateToMJD(dayjs(key)), key, ...value].join(',')).join('\n'), // rows
        ].join('\n'),
      ],
      { type: 'text/csv' },
    );

    // Save csv to computer, named by chart title and date now
    saveAs(blob, `${name.replace(/ /g, '-').toLowerCase()}-${new Date(Date.now()).toISOString()}.csv`);
  };

  const clearAll = () => {
    const emptyArr = plotsState.map((point) => {
      // eslint-disable-next-line no-param-reassign
      point.x = [];
      // eslint-disable-next-line no-param-reassign
      point.y = [];
      return point;
    });
    setPlotsState(emptyArr);
  };

  /** Handle new data incoming from the Context */
  useEffect(() => {
    plotsState.forEach((p, i) => {
      // Upon context change, see if changes affect this chart's values
      if (state && realm && state[realm]
        && ((!(process.env.FLIGHT_MODE === 'true') && state[realm].recorded_time)
        || (process.env.FLIGHT_MODE === 'true' && state[realm][p.timeDataKey]))
        && state[realm][p.YDataKey] != null
        && p.live
      ) {
        // If so, push to arrays and update state

        if (showZero || (!showZero && state[realm][p.YDataKey])) {
          // Check if polar or not
          if (polar) {
            if (process.env.FLIGHT_MODE === 'true' && state[realm][p.timeDataKey]) {
              plotsState[i].r.push(mjdToUTCString(state[realm][p.timeDataKey]));
            } else {
              plotsState[i].r.push(mjdToUTCString(state[realm].recorded_time));
            }

            plotsState[i]
              .theta
              .push(
                plotsState[i].processThetaDataKey
                  ? plotsState[i].processThetaDataKey(state[realm][p.YDataKey])
                  : state[realm][p.ThetaDataKey],
              );
          } else {
            if (process.env.FLIGHT_MODE === 'true' && state[realm][p.timeDataKey]) {
              plotsState[i].x.push(mjdToUTCString(state[realm][p.timeDataKey]));
            } else {
              plotsState[i].x.push(mjdToUTCString(state[realm].recorded_time));
            }

            plotsState[i]
              .y
              .push(
                plotsState[i].processYDataKey
                  ? plotsState[i].processYDataKey(state[realm][p.YDataKey])
                  : state[realm][p.YDataKey],
              );
          }
        }

        // Upon insertion, check if the length of y exceeds the data limit.
        // If so, shift out the #points in the graph - #data limit oldest values
        const dataPoints = plotsState[i].y.length;
        if (dataPoints >= dataLimitState && dataLimitState !== -1) {
          plotsState[i].x.splice(0, dataPoints - dataLimitState + 1);
          plotsState[i].y.splice(0, dataPoints - dataLimitState + 1);
        }

        // Trigger the chart to update
        layout.datarevision += 1;
        setDataRevision(dataRevision + 1);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    if (queriedData) {
      plotsState.forEach(({ timeDataKey, YDataKey, processYDataKey }, i) => {
        if (queriedData[YDataKey]) {
          if (queriedData[YDataKey].length === 0 || queriedData[timeDataKey].length === 0) {
            message.warning(`No data for specified date range in for ${YDataKey}/${timeDataKey}.`);
          } else {
            message.success(`Retrieved ${queriedData[YDataKey].length} records in ${YDataKey}/${timeDataKey}.`);

            plotsState[i].x = queriedData[timeDataKey].map((x) => mjdToUTCString(x));
            plotsState[i].y = processYDataKey
              ? queriedData[YDataKey].map((y) => processYDataKey(y))
              : queriedData[YDataKey];
          }
        }
      });

      dispatch(incrementQueue());

      setLayout({
        ...layout,
        dataRevision: layout.dataRevision + 1,
      });

      setDataRevision(dataRevision + 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queriedData]);

  /** Process edit value form */
  const processForm = (id) => {
    // Destructure form, field, index to retrieve changed field
    const [form, field, index] = id.split('_');
    // Check type of form
    if (form === 'plotsForm') {
      const fields = plotsForm.getFieldsValue();
      // Update state values
      switch (field) {
        case 'name':
          setNameState(fields.name);
          break;
        case 'dataLimit':
          setDataLimitState(fields.dataLimit);
          break;
        case 'globalChartMode':
          setPlotsState(plotsState.map((value, i) => {
            editForm.setFieldsValue({
              [`mode_${i}`]: fields.globalChartMode,
            });

            return {
              x: value.x,
              y: value.y,
              name: value.name,
              nodeProcess: value.nodeProcess,
              YDataKey: value.YDataKey,
              timeDataKey: value.timeDataKey,
              processYDataKey: value.processYDataKey,
              type: value.type,
              mode: fields.globalChartMode,
              live: value.live,
              marker: value.marker,
            };
          }));
          break;
        default:
          break;
      }
    } else if (form === 'editForm') {
      // Update edit form values
      const fields = editForm.getFieldsValue();

      switch (field) {
        case 'processYDataKey':
          plotsState[index][field] = new Function('x', fields[`${field}_${index}`]); // eslint-disable-line no-new-func
          break;
        case 'marker':
          plotsState[index][field].color = fields[`${field}_${index}`];
          break;
        default:
          plotsState[index][field] = fields[`${field}_${index}`];
          break;
      }

      // Update state since we mutate it by modifying plotsState
      setUpdateComponent(!updateComponent);
    }
  };

  /**
   * Process form, set y range in view
   */
  const setYRange = () => {
    const fields = plotsForm.getFieldsValue();

    if ((fields.YRangeMin
          && fields.YRangeMax)
          || (fields.YRangeMin.toString()
          && fields.YRangeMax.toString())
    ) {
      layout.yaxis.range = [fields.YRangeMin, fields.YRangeMax];
      layout.datarevision += 1;
      layout.uirevision += 1;
      setDataRevision(dataRevision + 1);
    } else {
      message.error('Fill in the range fields.');
    }
  };

  return (
    <BaseComponent
      name={nameState}
      subheader={<ChartValues plots={plotsState} />}
      liveOnly
      toolsSlot={(
        <>
          <Button
            className="mr-2"
            onClick={() => {
              layout.yaxis.range = returnDefaultYAxisRange(defaultYAxis);
              layout.datarevision += 1;
              layout.uirevision += 1;
              setDataRevision(dataRevision + 1);
            }}
            disabled={!defaultYAxis}
            size="small"
          >
            Revert Y Axis
          </Button>
          {
            dataLimitState !== -1 ? (
              <Tag icon={<ExclamationCircleOutlined />} color="warning">
                <strong>Data Limit:</strong>
                &nbsp;
                {dataLimitState}
              </Tag>
            ) : (
              <Tag icon={<CheckCircleOutlined />} color="success">
                <strong>Data Limit:</strong>
                &nbsp;
                &infin;
              </Tag>
            )
          }

          <Switch
            checkedChildren="X Scroll"
            unCheckedChildren="Y Scroll"
            checked={layout.yaxis.fixedrange}
            onChange={(checked) => {
              if (checked) {
                layout.yaxis.fixedrange = true;
                layout.xaxis.fixedrange = false;
              } else {
                layout.yaxis.fixedrange = false;
                layout.xaxis.fixedrange = true;
              }

              setDataRevision(dataRevision + 1);
            }}
          />

          &nbsp;

          <Popconfirm
            title="Are you sure you want to clear the chart of all values?"
            onConfirm={() => clearAll()}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small">
              <ClearOutlined />
            </Button>
          </Popconfirm>

          &nbsp;

          <Button size="small" onClick={() => downloadDataAsCSV()}>
            <DownloadOutlined />
          </Button>
        </>
      )}
      formItems={(
        <>
          {/* Global forms */}
          <Form
            form={plotsForm}
            layout="vertical"
            name="plotsForm"
            initialValues={{
              name,
              dataLimit,
            }}
          >
            <Form.Item label="Name" name="name" hasFeedback>
              <Input onBlur={({ target: { id } }) => processForm(id)} />
            </Form.Item>
            <Form.Item
              label="Data Limit"
              name="dataLimit"
              hasFeedback
              help="No limit => -1, Limit => positive value"
            >
              <InputNumber
                min={-1}
                max={Infinity}
                onBlur={({ target: { id } }) => processForm(id)}
              />
            </Form.Item>

            &nbsp;&nbsp;

            <Form.Item name="YRangeMin" noStyle>
              <InputNumber />
            </Form.Item>

            &nbsp;to&nbsp;

            <Form.Item name="YRangeMax" noStyle>
              <InputNumber />
            </Form.Item>

            &nbsp;&nbsp;

            <Button
              onClick={setYRange}
            >
              Set Y Range
            </Button>
            <Form.Item className="pt-3" label="Chart Mode" name="globalChartMode">
              <Select
                showSearch
                placeholder="Chart Mode"
                onBlur={({ target: { id } }) => processForm(id)}
              >
                <Select.Option value="lines">lines</Select.Option>
                <Select.Option value="marker">marker</Select.Option>
                <Select.Option value="markers">markers</Select.Option>
                <Select.Option value="text">text</Select.Option>
                <Select.Option value="lines+markers">lines+markers</Select.Option>
                <Select.Option value="lines+markers+text">lines+markers+text</Select.Option>
                <Select.Option value="none">none</Select.Option>
              </Select>
            </Form.Item>
          </Form>
          <br />
        </>
      )}
    >
      <Plot
        id="plot"
        className="w-full"
        data={plotsState}
        config={{
          scrollZoom: true,
          toImageButtonOptions: {
            filename: `${name.replace(/ /g, '-').toLowerCase()}-${new Date(Date.now()).toISOString()}`,
          },
          showlegend: false,
        }}
        layout={layout}
        revision={dataRevision}
        useResizeHandler
      />
      {children}
    </BaseComponent>
  );
}

Chart.propTypes = {
  /** Name of the component to display at the top */
  name: PropTypes.string,
  /** Axis range view of the chart */
  defaultYAxis: PropTypes.string,
  /** Specify limit on how many data points can be displayed per key */
  dataLimit: PropTypes.number,
  /** Ability to show the zero values or not */
  showZero: PropTypes.bool,
  /** Plot options for each chart */
  plots: PropTypes.arrayOf(
    PropTypes.shape({
      /** Array of chart y values */
      x: PropTypes.arrayOf(PropTypes.any),
      /** Array of chart x values */
      y: PropTypes.arrayOf(PropTypes.any),
      /** Plot.ly chart type */
      type: PropTypes.string,
      marker: PropTypes.shape({
        /** Chart marker color */
        color: PropTypes.string,
      }),
      /** Plot.ly chart mode */
      mode: PropTypes.string,
      /** Chart name/title */
      name: PropTypes.string,
      /** Name of the node:process to listen to */
      nodeProcess: PropTypes.string,
      /** Data key to plot on the y-axis */
      YDataKey: PropTypes.string,
      /** Function to modify the Y Data key */
      processYDataKey: PropTypes.func,
      /** Time data key of Y Data Key */
      timeDataKey: PropTypes.string,
      /** Whether the chart displays live values */
      live: PropTypes.bool,
    }),
  ),
  /** Specify whether this chart is a polar or cartesian plot */
  polar: PropTypes.bool,
  /** Children node */
  children: PropTypes.node,
};

Chart.defaultProps = {
  name: '',
  defaultYAxis: null,
  dataLimit: 5000,
  showZero: false,
  polar: false,
  plots: [],
  children: null,
};

export default Chart;
