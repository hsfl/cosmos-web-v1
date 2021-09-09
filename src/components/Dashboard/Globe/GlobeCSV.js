import { Cartesian3, SampledPositionProperty, JulianDate, ReferenceFrame } from 'cesium';
import { MJDtoJavaScriptDate } from '../../../utility/time';

// Return a new SampledPositionProperty to display
const createPaths = (data) => {
  const paths = [];
  const attrPaths = [];

  // Iterate over each satelites' arrays
  data.data.forEach((satDataEntries) => {
    const path = new SampledPositionProperty(ReferenceFrame.INERTIAL);
    const attrPath = new SampledPositionProperty(ReferenceFrame.INERTIAL);
    // Iterate over the array of values
    satDataEntries.forEach((entry) => {
      // Add time/position point to path
      let x = entry[data.nameIdx.x_pos];
      let y = entry[data.nameIdx.y_pos];
      let z = entry[data.nameIdx.z_pos];
      let pos = Cartesian3.fromArray([x, y, z]);
      let time = entry[data.nameIdx.t_pos];
      let date = JulianDate.fromDate(
        MJDtoJavaScriptDate(time),
      );
      path.addSample(date, pos);

      // Add attractor time/position point to attrPath
      x = entry[data.nameIdx.x_attractor];
      y = entry[data.nameIdx.y_attractor];
      z = entry[data.nameIdx.z_attractor];
      pos = Cartesian3.fromArray([x, y, z]);
      time = entry[data.nameIdx.t_pos];
      date = JulianDate.fromDate(
        MJDtoJavaScriptDate(time),
      );
      attrPath.addSample(date, pos);
    });
    paths.push(path);
    attrPaths.push(attrPath);
  });

  // Eslint will complain otherwise
  // const ret = data;
  // ret.paths = paths;
  return [paths, attrPaths];
};

export default createPaths;
