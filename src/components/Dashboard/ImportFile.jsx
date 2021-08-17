import React from 'react';
import { useDispatch } from 'react-redux';

import {
  Upload, message,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

import BaseComponent from '../BaseComponent';
import { set } from '../../store/actions';

const ImportFile = () => {
  const dispatch = useDispatch();

  // Array of column names
  const colNames = [];

  // Data is CSV formatted, one node entry per line in the format of colNames
  const parseFile = (text) => {
    const data = {
      // Dict of node:process's, with an associated index position for data
      sats: {},
      // Number values
      // Formatted:
      // data: [
      //   [[0,0,0,...], ...], <- satellite 0 data
      //   [[0,0,0,...], ...], <- satellite 1 data
      //   ...,                   ...etc
      // ]
      data: [],
      // Dictionary matching column name to the index
      // (index subtracted by 2 because node and agent names are ignored)
      nameIdx: {},
      // Time range
      start: Number.MAX_VALUE,
      stop: 0,
    };
    const allLines = text.replace(/\r\n$|\n$/, '').split(/\r\n|\n/);
    const success = allLines.every((line, i) => {
      // Split on tabs, remove trailing tab
      const entry = line.replace(/\t$/, '').split('\t');
      // If splitting on commas
      // const entry = line.replace(/,$/, '').split(',');
      if (i === 0) {
        // Populate colNames with column names specified in header
        colNames.length = 0;
        colNames.push(...entry);
        // Associate name with index
        colNames.forEach((value, ci) => {
          data.nameIdx[value] = ci - 2;
        });
        return true;
      }
      // Make sure number of elements match
      if (entry.length !== colNames.length) {
        return false;
      }
      // Create new node:process entry in data
      const nodeProcess = entry.splice(0, 2).join(':');
      if (data.sats[nodeProcess] === undefined) {
        data.sats[nodeProcess] = Object.keys(data.sats).length;
        data.data.push([]);
      }
      // Push to its array of values, after converting strings to Numbers
      const newData = entry.map(Number);
      data.data[data.sats[nodeProcess]].push(newData);

      // Update time range if applicable
      const timeStamp = newData[data.nameIdx.t_pos];
      if (timeStamp < data.start) data.start = timeStamp;
      else if (timeStamp > data.stop) data.stop = timeStamp;

      return true;
    });

    if (!success) {
      message.error('Not a properly formatted CSV File');
      return null;
    }

    return data;
  };

  const importCSV = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();

    // File load success
    reader.onload = () => {
      const data = parseFile(reader.result);
      resolve(data);
    };

    // File read error
    reader.onerror = () => reject;

    reader.readAsText(file);
  });

  const handleUpload = (file) => {
    // Import data then update state
    const csv = importCSV(file);
    csv.then((data) => {
      dispatch(set('simData', data));
    });
    return false;
  };

  return (
    <BaseComponent
      name="Upload"
      movable
    >
      <Upload.Dragger
        multiple={false}
        showUploadList={false}
        beforeUpload={handleUpload}
      >
        <UploadOutlined />
        &nbsp;
        Import CSV File
      </Upload.Dragger>
    </BaseComponent>
  );
};

ImportFile.propTypes = {};

export default ImportFile;
