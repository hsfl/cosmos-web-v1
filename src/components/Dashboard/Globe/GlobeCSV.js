import { Cartesian3, SampledPositionProperty, JulianDate } from 'cesium';
import { MJDtoJavaScriptDate } from '../../../utility/time';

// Return a new SampledPositionProperty to display
const createPaths = (data) => {
  const paths = [];

  // Iterate over each satelites' arrays
  data.data.forEach((satDataEntries) => {
    const path = new SampledPositionProperty();
    // Iterate over the array of values
    satDataEntries.forEach((entry) => {
      // Add time/position point to path
      const x = entry[data.nameIdx['c->node.loc.pos.eci.s.x']];
      const y = entry[data.nameIdx['c->node.loc.pos.eci.s.y']];
      const z = entry[data.nameIdx['c->node.loc.pos.eci.s.z']];
      const pos = Cartesian3.fromArray([x, y, z]);
      const time = entry[data.nameIdx['c->node.loc.pos.eci.utc']];
      const date = JulianDate.fromDate(
        MJDtoJavaScriptDate(time),
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

export default createPaths;
