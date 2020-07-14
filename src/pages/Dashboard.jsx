import React, {
  useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import {
  Button,
  message,
  Drawer,
  Form,
  Input,
  Modal,
  Tabs,
  Divider,
  Space,
  Slider,
  Col,
  Row,
  InputNumber,
  DatePicker,
  Menu,
} from 'antd';
import { Responsive, WidthProvider } from 'react-grid-layout';
import {
  CloseOutlined,
  EditOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';

import { axios, socket } from '../api';
import routes from '../routes';
import defaultComponent from '../components/Default/Default';
import { set, setData, setActivity } from '../store/actions';

import AsyncComponent, { components } from '../components/AsyncComponent';
import LayoutSelector from '../components/LayoutSelector';
import Clock from '../components/Clock';
import SocketStatus from '../components/SocketStatus';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const ResponsiveGridLayout = WidthProvider(Responsive);

const breakpoints = {
  lg: 996,
};

const cols = {
  lg: 12,
};

const margin = [12, 12];

function Dashboard({
  id,
  defaultLayout,
  path,
  realms,
}) {
  const dispatch = useDispatch();

  /** Store the default page layout in case user wants to switch to it */
  const [defaultPageLayout, setDefaultPageLayout] = useState({
    lg: [],
  });

  const [tabs, setTabs] = useState({
    lg: [],
  });

  /** Currently selected layout in use */
  const [layouts, setLayouts] = useState({
    lg: [],
  });

  /** Control the visibility of the layout editor on dashboard */
  const [visible, setVisible] = useState(false);
  /** Track mouse movements */
  // const [mouseY, setMouseY] = useState(null);
  /** Variable for the height of the drawer */
  const [height/* , setHeight */] = useState(400);
  /** Original mouse position */
  // const [origMouseY, setOrigMouseY] = useState(null);

  /** State for editing JSON of the layout */
  const [jsonEdit, setJsonEdit] = useState('');

  /** String for the component editor */
  const [componentEditor, setComponentEditor] = useState(JSON.stringify({
    i: 'Will be randomly generated',
    x: 0,
    y: 0,
    w: 4,
    h: 7,
    component: {},
  }, null, 2));

  const [dimensions, setDimensions] = useState([4, 7]);

  /** Control visibility of the save layout form */
  const [formVisible, setFormVisible] = useState(false);
  /** Form for saving layout */
  const [formSave] = Form.useForm();
  /** Error from the form */
  const [formError, setFormError] = useState('');
  /** Update the dropdown to select layouts */
  const [updateLayoutSelector, setUpdateLayoutSelector] = useState(false);

  const [socketStatus, setSocketStatus] = useState('error');

  const [globalHistoricalDate, setGlobalHistoricalDate] = useState(null);

  /** Get socket data from the agent */
  useEffect(() => {
    const live = socket('/live/all');

    // Set current realm
    dispatch(set('realm', id));

    /** Get latest data from neutron1_exec */
    live.onmessage = ({ data }) => {
      try {
        const json = JSON.parse(data);
        const [node, process] = json.node_type.split(':');

        if (json.node_type === 'list') {
          dispatch(set('list', json));
        } else if (realms[id].includes(node) && process !== 'soh') {
          // Store in realm object
          dispatch(setData(id, json));

          dispatch(setActivity({
            status: 'success',
            summary: 'Data received',
            scope: `from ${json.node_type}`,
            time: dayjs(),
          }));
        }
      } catch (error) {
        message.error(error.message);
      }
    };

    /** Update statuses on error/connection */
    live.onclose = () => {
      setSocketStatus('error');
    };

    live.onerror = () => {
      setSocketStatus('error');
    };

    live.onopen = () => {
      setSocketStatus('success');
    };

    return () => {
      live.close(1000);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function fetchNamespace() {
      try {
        const agents = await axios.get('/namespace/all');

        dispatch(set('namespace', agents.data));
      } catch (error) {
        message.error(error.message);
      }
    }

    fetchNamespace();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Retrieve default layout for page */
  useEffect(() => {
    // By default, set the defaultLayout prop as a flive.ack if child doesn't have a layout set
    let layout = defaultLayout;

    // Find child route of dashboard and retrieve default layout
    routes.forEach((route) => {
      if (route.path === path && route.children) {
        route.children.forEach((child) => {
          // Get page layout from route config and save it into the state
          if (child.path.split('/')[1] === id && child.defaultLayout) {
            layout = child.defaultLayout;
            setDefaultPageLayout(child.defaultLayout);
          }

          // Get page layout simple from route config and save it into the state
          if (child.path.split('/')[1] === id && child.tabs) {
            setTabs(child.tabs);
          }
        });
      }
    });

    // Set timeout to let the grid initialize; won't work otherwise.
    setTimeout(() => {
      setLayouts(layout);
    }, 100);
  }, [defaultLayout, id, path]);

  /** Save layout */
  const saveLayout = (dashname) => {
    const route = path.split('/')[1];
    // Store the layout into localStorage
    try {
      try {
        setUpdateLayoutSelector(true);
        // Check if the route already has an object to store the saved layout
        if (!(typeof JSON.parse(localStorage.getItem(route)) === 'object')
          && JSON.parse(localStorage.getItem(route) !== null)
        ) {
          throw new Error(`${route} is not an array.`);
        }
      } catch (error) {
        // If not, set it to an empty object
        localStorage.setItem(route, JSON.stringify({}));
      }

      // Store the layout based on the name given
      localStorage.setItem(route, JSON.stringify({
        ...JSON.parse(localStorage.getItem(route)),
        [dashname]: layouts,
      }));

      setUpdateLayoutSelector(false);
      message.success('Layout saved successfully.', 10);
    } catch {
      message.error('Error saving layout.', 10);
    }
  };

  /**
   * Checks to see if the layout array's objects contain all of the correct keys
   */
  const processLayoutObject = () => {
    try {
      const json = JSON.parse(jsonEdit);

      // Check if pass in an array of objects
      if (!json.length) {
        throw new Error('Outer container must be an array.');
      }

      // Validate the required fields
      json.forEach((component, i) => {
        if (!component
          || !('i' in component)
          || !('x' in component)
          || !('y' in component)
          || !('w' in component)
          || !('h' in component)
          || !('component' in component)
          || !('name' in component.component)
        ) {
          throw new Error(`Object number ${i} object must contain a key (i), width (x), height (y) and component (component.name)`);
        }
      });

      // If all valid, set the layout object
      setLayouts({
        lg: json,
      });

      message.success('Successfully updated layout.');

      // Reset form error message
      setFormError('');
    } catch (error) {
      setFormError(error.message);
    }
  };

  /** Set the layout based on using the LayoutSelector function */
  const selectLayout = (layout) => {
    if (layout === 'defaultRouteLayout') {
      setLayouts(defaultLayout);
    } else if (layout === 'defaultPageLayout') {
      setLayouts(defaultPageLayout);
    } else if (layout === 'defaultPageLayoutSimple') {
      // setLayouts(defaultPageLayoutSimple);
    } else {
      setLayouts(layout);
    }

    message.success('Successfully changed layout.');
  };

  const deleteComponent = (e) => {
    try {
      const key = e.currentTarget.getAttribute('layoutkey');
      const newLayout = layouts.lg.filter((el) => el.i !== key);
      setLayouts({
        lg: newLayout,
      });
      message.success('Successfully deleted component.');
    } catch (err) {
      message.error(err);
    }
  };

  const addToLayout = (elemParams) => {
    try {
      const add = JSON.parse(componentEditor);

      if (elemParams) {
        add.x = elemParams.x;
        add.y = elemParams.y;
      }

      let rand;
      let newId;

      do {
        rand = Math.random()
          .toString(36)
          .substring(7);
        newId = `${path.split('/')[1]}-${id}-${rand}`;
        // eslint-disable-next-line no-loop-func
      } while (layouts.lg.filter((object) => object.i === newId).length);

      add.i = newId;

      setLayouts({
        lg: [
          ...layouts.lg,
          add,
        ],
      });

      message.success('Successfully added component.');
    } catch {
      message.error('Error adding component.');
    }
  };

  useEffect(() => {
    setJsonEdit(JSON.stringify(layouts.lg, null, 2));
  }, [layouts]);

  const retrieveInfo = (e) => {
    const compName = e.currentTarget.getAttribute('keyid');
    const retrieved = defaultComponent.find((el) => el.name === compName);
    const modify = JSON.parse(componentEditor);

    modify.component.name = retrieved.name;
    modify.component.props = retrieved.props;
    setComponentEditor(JSON.stringify(modify, null, 2));
  };

  const changeDimensions = (value, dim) => {
    const change = JSON.parse(componentEditor);

    switch (dim) {
      case 'w':
        setDimensions([value, dimensions[1]]);
        change.w = value;
        break;
      case 'h':
        setDimensions([dimensions[0], value]);
        change.h = value;
        break;
      default:
        break;
    }

    setComponentEditor(JSON.stringify(change, null, 2));
  };

  /* const getMousePosition = (e) => {
    setMouseY(e.clientY);
  };

  useEffect(() => {
    if (origMouseY !== 0 && origMouseY !== null) {
      const calculateHeight = height + (origMouseY - mouseY);
      if (calculateHeight >= 100 && calculateHeight <= 950) {
        setHeight(height + (origMouseY - mouseY));
        setOrigMouseY(mouseY);
      }
    }
  }); */

  const checkComponentJson = () => {
    try {
      JSON.parse(componentEditor);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div>
      <div className="sticky z-10 top-0">
        <div
          className="flex justify-between component-color py-2 px-5 border-gray-200 border-solid border-b"
        >
          <div>
            <Clock />
          </div>
          <div className="pt-4">
            <SocketStatus
              status={socketStatus}
            />
          </div>
          <div className="pt-2">
            <RangePicker
              className="mr-3"
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              onChange={(m) => setGlobalHistoricalDate(m)}
              value={globalHistoricalDate}
            />
            <Button
              disabled={!globalHistoricalDate}
              onClick={() => {
                const num = layouts.lg.filter((el) => el.component.name === 'Chart').length;
                dispatch(set('globalQueue', num));
                dispatch(set('globalHistoricalDate', globalHistoricalDate));
              }}
            >
              Set Global Historical Date
            </Button>
          </div>
        </div>
        <Menu mode="horizontal">
          <Menu.Item onClick={() => setLayouts(defaultPageLayout)}>
            Overview
          </Menu.Item>
          {
            Object.keys(tabs).map((tab) => (
              <Menu.Item key={tab} onClick={() => setLayouts(tabs[tab])}>{tab}</Menu.Item>
            ))
          }
          <Menu.Item className="float-right">
            <LayoutSelector
              path={path}
              updateLayout={updateLayoutSelector}
              selectLayout={(value) => selectLayout(value)}
            />
            <Button
              key="savelayout"
              className="ml-3"
              type="primary"
              onClick={() => setFormVisible(true)}
            >
              Save Layout
            </Button>
            <Modal
              key="inputname"
              visible={formVisible}
              title="Save Current Layout"
              onCancel={() => setFormVisible(false)}
              okText="Save"
              cancelText="Cancel"
              onOk={() => {
                formSave.validateFields()
                  .then((values) => {
                    saveLayout(values.dashname);
                    setFormVisible(false);
                    formSave.resetFields();
                  });
              }}
            >
              <Form
                layout="vertical"
                form={formSave}
              >
                <Form.Item
                  name="dashname"
                  required
                  label="Dashboard Name"
                  rules={[{ required: true, message: 'Please enter a name for the layout.' }]}
                >
                  <Input
                    placeholder="Dashboard Name"
                  />
                </Form.Item>
              </Form>
            </Modal>
          </Menu.Item>
        </Menu>
      </div>
      <div className="mt-5 mx-16 mb-16">
        <ResponsiveGridLayout
          className="layout"
          breakpoints={breakpoints}
          cols={cols}
          layouts={layouts}
          margin={margin}
          draggableHandle=".dragHandle"
          draggableCancel=".preventDragHandle"
          rowHeight={20}
          isDroppable
          onDrop={(elemParams) => addToLayout(elemParams)}
        >
          {
              layouts !== null
                && layouts.lg !== null
                ? layouts.lg
                  .filter(
                    (layout) => layout && layout.i && layout.component && layout.component.name,
                  )
                  .map((layout) => (
                    <div
                      className="shadow overflow-y-scroll rounded component-color"
                      key={layout.i}
                    >
                      <AsyncComponent
                        component={layout.component.name}
                        props={layout.component.props}
                      />
                      <Button
                        className={`absolute bottom-0 left-0 z-50 mb-1 ml-1 ${visible ? 'block' : 'hidden'}`}
                        shape="circle"
                        layoutkey={layout.i}
                        icon={<CloseOutlined />}
                        onClick={(e) => deleteComponent(e)}
                      />
                    </div>
                  )) : null
            }
        </ResponsiveGridLayout>
        <Drawer
          placement="bottom"
          onClose={() => setVisible(false)}
          visible={visible}
          key="bottom"
          mask={false}
          height={height}
        >
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          {/* <div
            className="handlebar fixed z-30 w-full h-2"
            style={{ top: -5, left: -10 }}
            onMouseDown={(e) => {
              setOrigMouseY(e.clientY);
              window.addEventListener('mousemove', getMousePosition);
              window.addEventListener('mouseup', () => {
                setOrigMouseY(0);
                window.removeEventListener('mousemove', getMousePosition);
              });
            }}
          >
            &nbsp;
          </div> */}
          <Tabs defaultActiveKey="1">
            <TabPane tab="Add Components" key="1">
              <Divider orientation="left">1. Choose component</Divider>
              { Object.keys(components).map((piece) => (
                <Button
                  key={piece}
                  className="mr-1"
                  keyid={piece}
                  onClick={(e) => retrieveInfo(e)}
                >
                  {piece}
                </Button>
              ))}
              <Divider orientation="left">
                <Space>2. Edit component&apos;s properties</Space>
              </Divider>
              <div className="flex">
                <pre className="flex-none language-json mb-2 h-64 w-2/4 overflow-y-scroll overflow-x-scroll resize-y cursor-text text-white">
                  <Editor
                    className="font-mono"
                    value={componentEditor}
                    onValueChange={(value) => setComponentEditor(value)}
                    highlight={(code) => highlight(code, languages.json)}
                    padding={10}
                  />
                </pre>
                <div className="flex-1 m-auto text-center">
                  <div>Height</div>
                  <Row justify="center">
                    <Col span={12}>
                      <Slider
                        min={2}
                        max={18}
                        onChange={(value) => changeDimensions(value, 'h')}
                        value={dimensions[1]}
                      />
                    </Col>
                    <Col span={4}>
                      <InputNumber
                        min={2}
                        max={18}
                        value={dimensions[1]}
                        onChange={(value) => changeDimensions(value, 'h')}
                      />
                    </Col>
                  </Row>
                  <br />
                  <div>Width</div>
                  <Row justify="center">
                    <Col span={12}>
                      <Slider
                        min={1}
                        max={12}
                        onChange={(value) => changeDimensions(value, 'w')}
                        value={dimensions[0]}
                      />
                    </Col>
                    <Col span={4}>
                      <InputNumber
                        min={1}
                        max={12}
                        value={dimensions[0]}
                        onChange={(value) => changeDimensions(value, 'w')}
                      />
                    </Col>
                  </Row>
                  <br />
                  <Button type="primary" onClick={() => addToLayout()}>Add Component to Layout</Button>
                </div>
              </div>
              <Divider orientation="left">Preview</Divider>
              {checkComponentJson() && JSON.parse(componentEditor).component.name
                ? (
                  <div
                    className="shadow mt-5 mx-16 mb-16 overflow-y-scroll rounded component-color"
                    style={{ width: `${(dimensions[0] / 12) * 100}%`, height: `${dimensions[1] * 30}px` }}
                    draggable
                  >
                    <AsyncComponent
                      component={JSON.parse(componentEditor).component.name}
                      props={JSON.parse(componentEditor).component.props}
                      height={JSON.parse(componentEditor).h}
                    />
                  </div>
                )
                : null}
            </TabPane>
            <TabPane tab="JSON Editor" key="2">
              <Button
                onClick={() => processLayoutObject()}
              >
                Update Layout
              </Button>
              <span className="text-red-500 ml-3 mb-3">
                {formError}
              </span>
              <pre
                className="language-json mb-2 h-64 overflow-y-scroll overflow-x-scroll resize-y cursor-text text-white"
              >
                <Editor
                  className="font-mono"
                  value={jsonEdit}
                  onValueChange={(value) => setJsonEdit(value)}
                  highlight={(code) => highlight(code, languages.json)}
                  padding={10}
                />
              </pre>
            </TabPane>
          </Tabs>
        </Drawer>
        <Button
          className="fixed right-0 bottom-0 mb-5 mr-5"
          icon={<EditOutlined />}
          type="primary"
          onClick={() => setVisible(true)}
          shape="circle"
          size="large"
        />
      </div>
    </div>
  );
}

Dashboard.propTypes = {
  id: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  defaultLayout: PropTypes.shape({}).isRequired,
  realms: PropTypes.shape(PropTypes.arrayOf(PropTypes.string)),
};

Dashboard.defaultProps = {
  realms: [],
};

export default React.memo(Dashboard);
