import defaultLayout from './neutron1/defaultLayout';
import BBB from './neutron1/BBB';
import Thermal from './neutron1/Thermal';
import OBC from './neutron1/OBC';
import ISISRadio from './neutron1/ISISRadio';
import DuplexRadio from './neutron1/DuplexRadio';
import Payload from './neutron1/Payload';
import EPSBattery from './neutron1/EPSBattery';
import EPSSolarPanel from './neutron1/EPSSolarPanel';
import EPSRange from './neutron1/EPSRange';
import ADCS from './neutron1/ADCS';
import ADCSCubestar from './neutron1/ADCSCubestar';
import GPS from './neutron1/GPS';
import Commands from './neutron1/Commands';

export default {
  name: 'neutron1',
  icon: 'qrcode',
  defaultLayout,
  tabs: {
    BBB,
    OBC,
    Thermal,
    'ISIS Radio': ISISRadio,
    'Duplex Radio': DuplexRadio,
    Payload,
    'EPS Battery': EPSBattery,
    'EPS Solar Panel': EPSSolarPanel,
    'EPS Range': EPSRange,
    ADCS,
    'ADCS Cubestar': ADCSCubestar,
    GPS,
    Commands,
  },
};
