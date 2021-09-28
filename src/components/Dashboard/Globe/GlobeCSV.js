import {
  Cartesian3,
  JulianDate,
  Quaternion,
  ReferenceFrame,
  SampledProperty,
  SampledPositionProperty,
  TimeInterval,
  Transforms,
} from 'cesium';
import HeadingPitchRoll from 'cesium/Source/Core/HeadingPitchRoll';
import { MJDtoJavaScriptDate } from '../../../utility/time';

// Return a new SampledPositionProperty to display
const createPaths = async (data) => {
  const paths = [];
  const attrPaths = [];
  const sensorPaths = [];
  const sensorOrientations = [];
  const startOrbit = JulianDate.fromDate(MJDtoJavaScriptDate(data.start));
  const stopOrbit = JulianDate.fromDate(MJDtoJavaScriptDate(data.stop));
  const interval = new TimeInterval({ start: startOrbit, stop: stopOrbit });
  // Wait for ICRF data for time interval that coordinate conversions will take place in
  await Transforms.preloadIcrfFixed(interval).then(() => {});

  // Iterate over each satelites' arrays
  data.data.forEach((satDataEntries) => {
    const path = new SampledPositionProperty(ReferenceFrame.INERTIAL);
    const attrPath = new SampledPositionProperty(ReferenceFrame.INERTIAL);
    let sensorPath = new SampledPositionProperty(ReferenceFrame.INERTIAL);
    let sensorOrientation = new SampledProperty(Quaternion);
    // Iterate over the array of values
    satDataEntries.forEach((entry) => {
      // Add time/position point to path
      const px = entry[data.nameIdx.x_pos];
      const py = entry[data.nameIdx.y_pos];
      const pz = entry[data.nameIdx.z_pos];
      const pos = Cartesian3.fromElements(px, py, pz);
      const time = entry[data.nameIdx.t_pos];
      const date = JulianDate.fromDate(
        MJDtoJavaScriptDate(time),
      );
      path.addSample(date, pos);

      // Add attractor time/position point to attrPath
      const attx = entry[data.nameIdx.x_attractor];
      const atty = entry[data.nameIdx.y_attractor];
      const attz = entry[data.nameIdx.z_attractor];
      const attpos = Cartesian3.fromElements(attx, atty, attz);
      attrPath.addSample(date, attpos);

      // Get target position
      const tarx = entry[data.nameIdx.x_target];
      const tary = entry[data.nameIdx.y_target];
      const tarz = entry[data.nameIdx.z_target];
      const tarpos = Cartesian3.fromElements(tarx, tary, tarz);

      // Sensor positional data
      // No rotation to target means no target, ignore
      if (entry[data.nameIdx.w_att_target] === 1) {
        sensorPath = undefined;
        sensorOrientation = undefined;
        return;
      }
      // Wouldn't want to attempt to addSample to an undefined
      if (sensorPath === undefined || sensorOrientation === undefined) {
        return;
      }
      const senpos = Cartesian3.midpoint(pos, tarpos, new Cartesian3());
      sensorPath.addSample(date, senpos);
      // Sensor attitude
      // Since everything in Cesium is in ECEF coordinates, define rotation matrix for ECI -> ECEF
      const ECIToECEF = Transforms.computeIcrfToFixedMatrix(date);
      const ECIToECEFquaternion = Quaternion.fromRotationMatrix(ECIToECEF);
      // ECI rotations
      const sensorQuaternion = new Quaternion(
        entry[data.nameIdx.x_att],
        entry[data.nameIdx.y_att],
        entry[data.nameIdx.z_att],
        entry[data.nameIdx.w_att],
      );
      // Body frame rotation
      const hpr = new HeadingPitchRoll(0, Math.PI, 0);
      const nadirQ = Quaternion.fromHeadingPitchRoll(hpr);
      // World coordinates ECI to ECEF, then in relative coordinates rotate to target
      const worldXtarget = Quaternion.multiply(
        ECIToECEFquaternion,
        sensorQuaternion,
        new Quaternion()
      );
      // Apply body frame rotations
      const worldXtargetXbody = Quaternion.multiply(worldXtarget, nadirQ, new Quaternion());

      sensorOrientation.addSample(date, worldXtargetXbody);
    });
    paths.push(path);
    attrPaths.push(attrPath);
    sensorPaths.push(sensorPath);
    sensorOrientations.push(sensorOrientation);
  });

  // Eslint will complain otherwise
  // const ret = data;
  // ret.paths = paths;
  return [paths, attrPaths, sensorPaths, sensorOrientations];
};

export default createPaths;
