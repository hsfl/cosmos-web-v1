import defaultLayout from './defaultLayout';
import BBB from './BBB';
import Thermal from './Thermal';
import OBC from './OBC';
import ISISRadio from './ISISRadio';
import DuplexRadio from './DuplexRadio';
import Payload from './Payload';
import EPSBattery from './EPSBattery';
import EPSSolarPanel from './EPSSolarPanel';
import EPSRange from './EPSRange';
import ADCS from './ADCS';
import ADCSCubestar from './ADCSCubestar';
import GPS from './GPS';
import Commands from './Commands';

export const Layout = {
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

export const NodeList = ['neutron1', 'beagle1', 'virtualhost.hsfl.hawaii.edu'];
