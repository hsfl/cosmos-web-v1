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
  Tooltip,
  Popconfirm,
} from 'antd';
import {
  CloseOutlined,
} from '@ant-design/icons';

import { useSelector } from 'react-redux';

import { axios } from '../../api';

import BaseComponent from '../BaseComponent';

/**
 * Allows user to create commands to store in the database.
 */
function CommandEditor({
  nodes,
}) {
  const mode = useSelector((s) => s.mode);

  /** List of commands stored in the node */
  const [commands, setCommands] = useState([]);
  /** Form to create a new command */
  const [commandForm] = Form.useForm();
  /** The global node to create/delete commands from */
  const [globalNode, setGlobalNode] = useState(nodes[0]);

  /** Get commands from the database, if query is a string, it deletes the command */
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
  const onFinish = async ({
    name,
    type,
    flag,
    command,
  }) => {
    if (commands.find((comm) => comm.event_name === name)) {
      message.error('Duplicate command cannot be created.');
    } else {
      try {
        await axios.post(`/commands/${globalNode}`, {
          command: {
            event_name: name,
            event_type: type,
            event_flag: flag,
            event_data: command,
          },
        });
        message.success(`Successfully created ${name}!`);
      } catch {
        message.error(`Error creating ${name}`);
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
                  onFinish={onFinish}
                >
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td>
                          <Tooltip placement="bottomLeft" title="Name of the command.">
                            <Form.Item
                              className="w-4/5"
                              label="Event Name"
                              name="name"
                              hasFeedback
                              rules={[{ required: true, message: 'Please type a name.' }]}
                            >
                              <Input placeholder="Name" />
                            </Form.Item>
                          </Tooltip>
                        </td>
                        <td rowSpan={2}>
                          <Tooltip placement="bottomLeft" title="ex: 8192.">
                            <Form.Item
                              label="Type"
                              name="type"
                              hasFeedback
                              rules={[{ required: true, message: 'Please choose a type.' }]}
                            >
                              <InputNumber placeholder="#" />
                            </Form.Item>
                          </Tooltip>
                        </td>
                        <td>
                          <Tooltip placement="bottomLeft" title="ex: 32768.">
                            <Form.Item
                              label="Flag"
                              name="flag"
                              hasFeedback
                              rules={[{ required: true, message: 'Please choose a flag.' }]}
                            >
                              <InputNumber placeholder="#" />
                            </Form.Item>
                          </Tooltip>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <Tooltip placement="top" title="ex: ls">
                    <Form.Item
                      label="Command"
                      name="command"
                      hasFeedback
                      rules={[{ required: true, message: 'Please type a command.' }]}
                    >
                      <Input placeholder="Linux command" prefix="➜" />
                    </Form.Item>
                  </Tooltip>
                  <Form.Item className="mb-0">
                    <Button htmlType="submit" type="primary">
                      Create
                    </Button>
                  </Form.Item>
                </Form>
              </td>
              <td>
                <Table
                  theme="dark"
                  className={`${mode}-mode border-l pl-4`}
                  columns={columns}
                  dataSource={commands}
                  size="small"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseComponent>
  );
}

CommandEditor.propTypes = {
  /** List of nodes available to be able to add commands to */
  nodes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default CommandEditor;
