import React, {
  useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Button,
  Table,
  Popconfirm,
} from 'antd';
import {
  CloseOutlined,
} from '@ant-design/icons';

// import Search from 'antd/lib/input/Search';
import { axios } from '../../api';

import BaseComponent from '../BaseComponent';

/**
 * Allows user to create commands to store in the database.
 */
function CommandEditor({
  nodes,
  height,
}) {
  /** List of commands stored in the node */
  const [commands, setCommands] = useState([]);
  /** Form to create a new command */
  const [commandForm] = Form.useForm();
  /** The global node to create/delete commands from */
  const [globalNode, setGlobalNode] = useState(nodes[0]);

  const queryCommands = async (query = false) => {
    try {
      if (query) {
        try {
          await axios.delete(`/commands/${globalNode}`, {
            data: {
              event_name: query,
            },
          });
          message.success(`${query} deleted successfully.`);
        } catch (err) {
          message.error(`Error deleting ${query}.`);
        }
      }

      const { data } = await axios.get(`/commands/${globalNode}`);

      setCommands(data);
    } catch (error) {
      message.error('Could not query commands from database.');
    }
  };

  const [columns] = useState([
    {
      title: 'Event Name',
      dataIndex: 'event_name',
      key: 'event_name',
    },
    {
      title: 'Type',
      dataIndex: 'event_type',
      key: 'event_type',
    },
    {
      title: 'Flag',
      dataIndex: 'event_flag',
      key: 'event_flag',
    },
    {
      title: 'Command',
      dataIndex: 'event_data',
      key: 'event_data',
    },
    {
      title: 'Actions',
      fixed: 'right',
      render: (text, record) => (
        <Popconfirm
          title="Are you sure you want to delete this command?"
          onConfirm={() => queryCommands(record.event_name)}
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

  /** Generate commands in database */
  const createCommand = async () => {
    const form = commandForm.getFieldsValue();

    if (commands.find((command) => command.event_name === form.name)) {
      message.error('Duplicate command cannot be created.');
    } else {
      try {
        await axios.post(`/commands/${globalNode}`, {
          command: {
            event_name: form.name,
            event_type: form.type,
            event_flag: form.flag,
            event_data: form.command,
          },
        });
        message.success(`Successfully created ${form.name}!`);
      } catch {
        message.error(`Error creating ${form.name}`);
      }

      commandForm.resetFields();
    }

    queryCommands();
  };

  useEffect(() => {
    queryCommands();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BaseComponent
      className="mb-0"
      name="Command Editor"
      liveOnly
      height={height}
      showStatus={false}
      toolsSlot={(
        <>
          Target Node:
          <Select
            className="ml-2 w-32"
            showSearch
            onChange={(value) => setGlobalNode(value)}
            onBlur={() => queryCommands()}
            placeholder="Select target node"
            defaultValue={globalNode}
            value={globalNode}
          >
            {
              nodes.map((n) => (
                <Select.Option
                  key={n}
                >
                  {n}
                </Select.Option>
              ))
            }
          </Select>
        </>
      )}
    >
      <div className="flex flex-wrap">
        <table className="w-full">
          <tbody>
            <tr>
              <td className="w-1/3 pr-3">
                <Form
                  form={commandForm}
                  layout="vertical"
                  name="commandForm"
                  onFinish={() => createCommand()}
                >
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td>
                          <Form.Item
                            className="w-4/5"
                            label="Event Name"
                            name="name"
                            rules={[{ required: true, message: 'Please type a name.' }]}
                          >
                            <Input placeholder="Name" />
                          </Form.Item>
                        </td>
                        <td rowSpan={2}>
                          <Form.Item
                            label="Type"
                            name="type"
                            rules={[{ required: true, message: 'Please choose a type.' }]}
                          >
                            <InputNumber placeholder="#" />
                          </Form.Item>
                        </td>
                        <td>
                          <Form.Item
                            label="Flag"
                            name="flag"
                            rules={[{ required: true, message: 'Please choose a flag.' }]}
                          >
                            <InputNumber placeholder="#" />
                          </Form.Item>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <Form.Item
                    label="Command"
                    name="command"
                    rules={[{ required: true, message: 'Please type a command.' }]}
                  >
                    <Input placeholder="ex: ls, /bin/systemctl stop agent_cpu" prefix="➜" />
                  </Form.Item>
                  <Form.Item className="mb-0">
                    <Button htmlType="submit" type="primary">
                      Create
                    </Button>
                  </Form.Item>
                </Form>
              </td>
              <td>
                <div className="border-l mr-1 h-40" />
              </td>
              <Table
                className="-m-2"
                columns={columns}
                dataSource={commands}
                size="small"
              />
            </tr>
          </tbody>
        </table>
      </div>
    </BaseComponent>
  );
}

CommandEditor.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.string).isRequired,
  height: PropTypes.number.isRequired,
};

export default CommandEditor;
