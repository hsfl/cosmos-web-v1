import React from 'react';
import { Tag } from 'antd';
import { CheckCircleTwoTone, ExclamationCircleTwoTone } from '@ant-design/icons';

function SocketStatus() {
  return (
    <>
      {
        process.env.FLIGHT_MODE === 'true'
          ? (
            <Tag icon={<CheckCircleTwoTone twoToneColor="#52c41a" />} color="success">
              Flight Mode
            </Tag>
          )
          : (
            <Tag icon={<ExclamationCircleTwoTone twoToneColor="#d80000" />} color="error">
              Debug Mode
            </Tag>
          )
      }
    </>
  );
}

export default SocketStatus;
