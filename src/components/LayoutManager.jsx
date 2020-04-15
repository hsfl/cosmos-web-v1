import React, { useState, useEffect } from 'react';
import {
  message,
  Button,
  Popover,
  Form,
  Select,
  Input,
  Table,
  Popconfirm,
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Responsive, WidthProvider } from 'react-grid-layout';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
// eslint-disable-next-line
import routes from '../routes';

import 'prismjs/components/prism-json';

import AsyncComponent from './AsyncComponent';

const ResponsiveGridLayout = WidthProvider(Responsive);

/**
 * Configurable editor that allows the user to set up the layout of the page
 */
function LayoutManager() {
  /** Store the layout object here */
  const [layoutObject, setLayoutObject] = useState({
    lg: [],
  });
  /** Store temporary form value here from code editor */
  const [layoutObjectForm, setLayoutObjectForm] = useState('');
  /** Store form values */
  const [form, setForm] = useState({});
  /** Store error if there was one from the form. */
  const [formError, setFormError] = useState('');
  /** Other message feedback here */
  const [outcome, setOutcome] = useState('');
  /** The routes that are currently available to pull from the local storage layouts */
  const [routeKeys, setRouteKeys] = useState([]);

  /** Handle deleting a saved layout from local storage */
  const deleteLayout = (route, name) => {
    const layouts = localStorage.getItem(route);

    try {
      const json = JSON.parse(layouts);

      // Delete selected key
      delete json[name];

      localStorage.setItem(route, JSON.stringify(json));

      window.location.reload();
    } catch (error) {
      message.error('An error occurred while deleting this layout', 5);
    }
  };

  /** Columns of the table */
  const [columns] = useState([
    {
      title: 'Route',
      dataIndex: 'route',
      key: 'route',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Actions',
      render: (text, { route, name }) => (
        <Popconfirm
          title="Are you sure you want to delete this layout?"
          onConfirm={() => deleteLayout(route, name)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="link"
          >
            <CloseOutlined />
          </Button>
        </Popconfirm>
      ),
    },
  ]);

  const [data, setData] = useState([]);

  /**
   * Checks to see if the layout array's objects contain all of the correct keys.
   *
   * @return {mixed} Whether the layout object is valid or not.
   */
  const processLayoutObject = () => {
    try {
      const json = JSON.parse(layoutObjectForm);

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
      setLayoutObject({
        lg: json,
      });

      // Reset form error message
      setFormError('');

      return {
        lg: json,
      };
    } catch (error) {
      setFormError(error.message);
    }

    return null;
  };

  /** Save the layout to localStorage. */
  const saveLayout = (route, name, layout) => {
    let object;

    if (!layout) {
      // If previewing, process the layout from the layoutObject state variable
      object = processLayoutObject();
    } else {
      // If saving, set layout passed in directly
      object = layout;
    }

    // Validate the required fields
    if (!route) {
      setFormError('"Route" is required.');
      return;
    }

    if (!name) {
      setFormError('"Dashboard Name" is required.');
      return;
    }

    // Store the layout into localStorage
    if (object) {
      try {
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
        [name]: object,
      }));

      message.success('Layout saved successfully.', 10);
    } else {
      setFormError('Error saving layout.');
    }
  };

  /** UI to reflect the outcome of the transaction. */
  useEffect(() => {
    setTimeout(() => {
      setOutcome('');
    }, 10000);
  }, [outcome]);

  /** Retrieve the keys that you can have settings for */
  useEffect(() => {
    // Get keys from routes configuration file and extract ones with `:id`
    const keys = routes
      .filter((route) => route.path.split('/')[2] === ':id')
      .map(({ path }) => {
        const [, route] = path.split('/');

        const layouts = localStorage.getItem(route);

        try {
          const json = JSON.parse(layouts);

          Object.keys(json)
            .forEach((layout, i) => {
              data.push({
                key: i,
                route,
                name: layout,
                configuration: JSON.stringify(json[layout]),
              });
            });
        } catch (error) {
          console.log(error);
        }
        return route;
      });

    setRouteKeys(keys);
  }, []);

  return (
    <div>
      <Table
        title={() => 'Saved Layouts'}
        size="small"
        className="mb-3"
        columns={columns}
        dataSource={data}
        expandedRowRender={({ route, name, key }) => (
          <div>
            <pre
              className="language-json mb-2 h-64 overflow-y-scroll overflow-x-scroll resize-y cursor-text text-white"
            >
              <Editor
                className="font-mono"
                value={data[key].configuration}
                onValueChange={(value) => {
                  const tempData = [...data];
                  tempData[key].configuration = value;
                  setData(tempData);
                }}
                highlight={(code) => highlight(code, languages.json)}
                padding={10}
              />
            </pre>

            <Button
              onClick={() => saveLayout(route, name, data[key].configuration)}
            >
              Save
            </Button>
          </div>
        )}
      />
      <Form layout="vertical">
        <Form.Item
          required
          label="Route"
          key="route"
          hasFeedback={form.route && form.route.touched}
          validateStatus={form.route && form.route.changed ? 'success' : ''}
          help="The route in which the dashboard will be saved under."
        >
          <Select
            showSearch
            placeholder="Route"
            onFocus={() => setForm({
              ...form,
              route: {
                ...form.route,
                touched: true,
                changed: false,
              },
            })}
            onChange={(value) => setForm({
              ...form,
              route: {
                ...form.route,
                value,
                changed: false,
              },
            })}
            onBlur={() => {
              setForm({
                ...form,
                route: {
                  ...form.route,
                  changed: true,
                },
              });
            }}
          >
            {
              routeKeys.map((route) => (
                <Select.Option
                  value={route}
                  key={route}
                >
                  {route}
                </Select.Option>
              ))
            }
          </Select>
        </Form.Item>

        <Form.Item
          required
          label="Dashboard Name"
          key="dashboardName"
          hasFeedback={form.dashboardName && form.dashboardName.touched}
          validateStatus={form.dashboardName && form.dashboardName.changed ? 'success' : ''}
          help="The name you want to give to the dashboard."
        >
          <Input
            placeholder="Dashboard Name"
            id="dashboardName"
            onFocus={({ target: { id: item } }) => setForm({
              ...form,
              [item]: {
                ...form[item],
                touched: true,
                changed: false,
              },
            })}
            onChange={({ target: { id: item, value } }) => setForm({
              ...form,
              [item]: {
                ...form[item],
                value,
                changed: false,
              },
            })}
            onBlur={({ target: { id: item } }) => {
              setForm({
                ...form,
                [item]: {
                  ...form[item],
                  changed: true,
                },
              });
            }}
          />
        </Form.Item>

        <Form.Item
          required
          label="Layout Array"
          help={(
            <div>
              Enter the layout array in JSON format.
              &nbsp;
              <Popover
                title="Information"
                placement="right"
                content={(
                  <div className="text-gray-600">
                    <p>
                      <span className="font-bold">
                        Sizing.&nbsp;
                      </span>
                      Each row has a length of twelve (12) on large screens
                      &nbsp;
                      (&gt;= 996 px) and a length of two (2) on small screens (&lt;= 996 px).
                    </p>
                    <p>
                      <span className="font-bold">
                        Formatting.&nbsp;
                      </span>
                      You must enter an array of objects. Each object contains a unique:
                    </p>
                    <ul className="list-disc list-inside ml-3">
                      <li>
                        Unique key (i) - to avoid conflicts with other layouts,
                        &nbsp;use the format: dashboardName-key
                      </li>
                      <li>
                        Width (w)
                      </li>
                      <li>
                        Height (h)
                      </li>
                      <li>
                        Horiztonal position (w)
                      </li>
                      <li>
                        Vertical position (y)
                      </li>
                      <li>
                        Component name (component.name)
                      </li>
                      <li>
                        Component props (component.props)
                      </li>
                    </ul>
                    <br />
                    <strong>Example.</strong>
                    <br />
                    <pre
                      className="language-json"
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{
                        __html: highlight(
                          '[\n  {\n    "i": "dashboardName-a",\n    "x": 0,\n    "y": 0,\n    "w": 4,\n    "h": 7,\n    "component": {\n      "name": "Status",\n      "props": {\n        "name": "Ok"\n      }\n    }\n  }\n]',
                          languages.json,
                          'json',
                        ),
                      }}
                    />
                  </div>
                )}
              >
                <QuestionCircleOutlined className="text-blue-500 cursor-pointer" />
              </Popover>
            </div>
          )}
        >
          <pre
            className="language-json mb-2 h-64 overflow-y-scroll resize-y cursor-text text-white"
          >
            <Editor
              className="font-mono"
              value={layoutObjectForm}
              onValueChange={(value) => setLayoutObjectForm(value)}
              highlight={(code) => highlight(code, languages.json)}
              padding={10}
            />
          </pre>
        </Form.Item>
      </Form>
      {/* <Modal
        title="Manage Layout"
        width="100%"
        visible={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        style={{ padding: '2em', top: 20 }}
      > */}

      <div className="text-red-500 mb-3">
        {formError}
      </div>

      <Button
        className="mr-2"
        onClick={() => processLayoutObject()}
      >
        Preview
      </Button>
      <Button
        className="mb-3"
        type="primary"
        onClick={() => saveLayout(form.route.value, form.dashboardName.value)}
      >
        Save Layout
      </Button>
      {
        // activity log from agents
        // output whats going out and in the ports
      }

      <div>
        {outcome}
      </div>

      <br />
      <br />
      <div>
        <ResponsiveGridLayout
          className="layout"
          breakpoints={{
            lg: 996,
          }}
          cols={{
            lg: 12,
          }}
          layouts={layoutObject}
          margin={[12, 12]}
          draggableHandle=".dragHandle"
          draggableCancel=".preventDragHandle"
          rowHeight={20}
        >
          {
            layoutObject !== null
              && layoutObject.lg !== null
              ? layoutObject.lg
                .filter((layout) => layout && layout.i && layout.component && layout.component.name)
                .map((layout) => (
                  <div key={layout.i} className="shadow overflow-x-auto component-color">
                    <AsyncComponent
                      component={layout.component.name}
                      props={layout.component.props}
                    />
                  </div>
                )) : null
          }
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}

export default LayoutManager;
