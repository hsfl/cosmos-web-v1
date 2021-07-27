import { Cartesian3, SampledPositionProperty, JulianDate } from 'cesium';
import { message } from 'antd';
import { MJDtoJavaScriptDate } from '../../../utility/time';

const dataFormat = [
  // Node info
  'node_name', 'agent_name',
  // Positional
  't_pos', 'x_pos', 'y_pos', 'z_pos',
  't_vel', 'x_vel', 'y_vel', 'z_vel',
  't_acc', 'x_acc', 'y_acc', 'z_acc',
  // Attitude
  't_att', 'a_att', 'b_att', 'c_att', 'd_att',
  // Target
  't_att_target', 'a_att_target', 'b_att_target', 'c_att_target', 'd_att_target',
  // Angular position
  't_omega', 'x_omega', 'y_omega', 'z_omega',
  't_alpha', 'x_alpha', 'y_alpha', 'z_alpha',
  // Thrust usage
  't_thrust', 'x_thrust', 'y_thrust', 'z_thrust',
  'thrust_x', 'thrust_y', 'thrust_z',
  // Torque
  't_torque', 'x_torque', 'y_torque', 'z_torque',
  // MAC output, acceleration differentials
  't_acc_diff', 'x_acc_diff', 'y_acc_diff', 'z_acc_diff',
  // Target info
  'target_latitude', 'target_longitude', 'target_altitude',
  // HCL output, estimated position of self
  'loc_est_utc', 'loc_est_x', 'loc_est_y', 'loc_est_z',
];

const dataFormatDict = {};
dataFormat.forEach((value, i) => {
  dataFormatDict[value] = i-2;
});

// Return a new SampledPositionProperty to display
const createPaths = (data) => {
  const paths = [];
  // Iterate over each satelites' arrays
  data.data.forEach((satDataEntry) => {
    const path = new SampledPositionProperty();
    // Iterate over the array of values
    satDataEntry.forEach((entry) => {
      // Add time/position point to path
      const pos = Cartesian3.fromArray([
        entry[dataFormatDict.x_pos],
        entry[dataFormatDict.y_pos],
        entry[dataFormatDict.z_pos],
      ]);
      const date = JulianDate.fromDate(
        MJDtoJavaScriptDate(entry[dataFormatDict.t_pos]),
      );
      path.addSample(date, pos);
    });
    paths.push(path);
  });

  // Eslint will complain otherwise
  // const ret = data;
  // ret.paths = paths;
  return paths;
};

// Data is CSV formatted, one node entry per line in the format of dataFormat
const importFile = (text) => {
  const data = {
    // Dict of node:process's, with an associated index position for data
    sats: {},
    // Number values
    data: [],
  };
  const allLines = text.replace(/\r\n$|\n$/, '').split(/\r\n|\n/);
  const success = allLines.every((line) => {
    // Split on comma and remove trailing commas
    const entry = line.replace(/, $/, '').split(', ');
    // Make sure number of elements match
    if (entry.length !== dataFormat.length) {
      return false;
    }
    // Create new node:process entry in data
    const nodeProcess = entry.splice(0, 2).join(':');
    if (data.sats[nodeProcess] === undefined) {
      data.sats[nodeProcess] = Object.keys(data.sats).length;
      data.data.push([]);
    }
    // Push to its array of values, after converting strings to Numbers
    data.data[data.sats[nodeProcess]].push(entry.map(Number));
    return true;
  });

  if (!success) {
    message.error('Not a properly formatted CSV File');
    return null;
  }

  return data;
};

export const importCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // File load success
    reader.onload = () => {
      const data = importFile(reader.result);

      const paths = createPaths(data);

      resolve(paths);
    };

    // File read error
    reader.onerror = () => {
      reject;
    };

    reader.readAsText(file);
  });
};

export default importCSV;
