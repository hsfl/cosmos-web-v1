import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'antd';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';

function SocketStatus({
  status,
}) {
  return (
    <>
      {
        status === 'success'
          ? (
            <Tag icon={<CheckCircleTwoTone twoToneColor="#52c41a" />} color="success">
              Connected.
            </Tag>
          )
          : (
            <Tag icon={<CloseCircleTwoTone twoToneColor="#d80000" />} color="error">
              No connection. Attempting to reconnect.
            </Tag>
          )
      }
    </>
  );
}

SocketStatus.propTypes = {
  status: PropTypes.string.isRequired,
};

export default SocketStatus;
