import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Upload, Button, message,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

import { axios } from '../../api';
import BaseComponent from '../BaseComponent';

function UploadFile({
  node,
  proc,
  command,
}) {
  /** Maintain list of uploaded files */
  const [files, setFiles] = useState([]);
  /** Loading state indicating when upload is occurring */
  const [loading, setLoading] = useState(false);
  /** Indicating if files are being uploaded or if you want to initiate an upload */
  const [buttonText, setButtonText] = useState('Upload Files');
  /** Intermediary between file uploading and sending content to agent */
  const [fileContentUpload, setFileContentUpload] = useState(null);

  /** File reader to get contents of uploaded file */
  const getFileContents = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsText(file);
  });

  /** See if file was read successfully */
  const checkUpload = (request) => {
    setTimeout(() => {
      if (files.filter((file) => (file.uid === request.file.uid))) {
        request.onSuccess(null, request.file);
      } else {
        checkUpload(request);
      }
    }, 100);
  };

  /** Extract file contents of uploaded files upon clicking button */
  const uploadFiles = async () => {
    setLoading(true);
    setButtonText('Uploading files ...');

    try {
      await Promise.all(files.map(async (file) => {
        try {
          const result = await getFileContents(file.originFileObj);

          setFileContentUpload(result);
        } catch (error) {
          message.error(error.message);
        }
      }));

      setFiles([]);

      setButtonText('Upload Files');
    } catch (error) {
      message.error('Error while attempting to upload files.', 10);
    }

    setLoading(false);
  };

  /** Send content to agent */
  useEffect(() => {
    async function sendCommand() {
      try {
        const { data } = await axios.post('/command', {
          command: `${process.env.COSMOS_BIN}/agent ${node} ${proc} ${command} ${fileContentUpload}`,
        });

        if (data) {
          message.success('Successfully uploaded all files!');
        }

        setFileContentUpload(null);
      } catch (error) {
        message.error('Error while attempting to upload files.');
      }
    }

    if (fileContentUpload !== null) {
      sendCommand();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileContentUpload]);

  return (
    <BaseComponent
      name="Upload"
      movable
    >
      <Upload.Dragger
        fileList={files}
        onChange={(file) => {
          setFiles([...file.fileList]);
        }}
        customRequest={(request) => checkUpload(request)}
      >
        <UploadOutlined />
        &nbsp;
        Select Files
      </Upload.Dragger>
      <br />
      <div className="text-center">
        <Button
          disabled={files.length === 0}
          type="primary"
          loading={loading}
          onClick={() => uploadFiles()}
          className="mb-3"
        >
          {buttonText}
        </Button>
      </div>
    </BaseComponent>
  );
}

UploadFile.propTypes = {
  node: PropTypes.string.isRequired,
  proc: PropTypes.string.isRequired,
  command: PropTypes.string.isRequired,
};

export default UploadFile;
