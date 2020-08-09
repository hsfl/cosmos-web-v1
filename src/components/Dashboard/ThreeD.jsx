// import React, { useState, useContext, useEffect } from 'react';
// import PropTypes from 'prop-types';

// import Worldview, {
//   GLTFScene, Axes,
// } from 'regl-worldview';

// import model from '../../public/cubesat.glb';

// import { Context } from '../../store/dashboard';

// /**
//  * Displays a 3D model.
//  */
// function ThreeD({
//   name,
//   attitudes,
//   height,
// }) {
//   /** Accessing the neutron1 messages from the socket */
//   const { state } = useContext(Context);

//   /** The state that manages the component's title */
//   const [nameState] = useState(name);
//   /** Storage for form values */
//   const [form] = useState({
//     newOrbit: {
//       live: true,
//     },
//   });
//   /** Currently displayed attitudes */
//   const [attitudesState, setAttitudesState] = useState(attitudes);

//   /** Initialize form slots for each orbit */
//   useEffect(() => {
//     // Make an object for each plot's form
//     for (let i = 0; i < attitudesState.length; i += 1) {
//       form[i] = {
//         live: attitudesState[i].live,
//       };
//     }
//   }, []);

//   /** Update the live attitude display */
//   useEffect(() => {
//     attitudesState.forEach((attitude, i) => {
//       if (state[attitude.nodeProcess]
//         && state[attitude.nodeProcess].node_loc_att_icrf
//         && state[attitude.nodeProcess].node_loc_att_icrf.pos
//         && attitude.live
//       ) {
//         const tempAttitude = [...attitudesState];

//         tempAttitude[i].quaternions = state[attitude.nodeProcess].node_loc_att_icrf.pos;

//         setAttitudesState(tempAttitude);
//       }
//     });
//   }, [state]);

//   return (
//     <>
//       <div
//         className="flex justify-between p-3 dragHandle cursor-move"
//         style={{ backgroundColor: '#f1f1f1' }}
//       >
//         <div className="font-bold text-lg mr-4">
//           {name}
//         </div>
//         {model}
//       </div>
//       <Worldview>
//         <GLTFScene model={model}>
//           {{
//             pose: {
//               position: { x: 0, y: 0, z: 0 },
//               orientation: {
//                 x: attitudesState[0].quaternions.d && attitudesState[0].quaternions.d.x
//                   ? attitudesState[0].quaternions.d.x : 0,
//                 y: attitudesState[0].quaternions.d && attitudesState[0].quaternions.d.y
//                   ? attitudesState[0].quaternions.d.y : 0,
//                 z: attitudesState[0].quaternions.d && attitudesState[0].quaternions.d.z
//                   ? attitudesState[0].quaternions.d.z : 0,
//                 w: attitudesState[0].quaternions.d && attitudesState[0].quaternions.d.w
//                   ? attitudesState[0].quaternions.d.w : 0,
//               },
//             },
//             scale: { x: 100, y: 100, z: 100 },
//           }}
//         </GLTFScene>
//         <Axes />
//       </Worldview>
//       <div className="overflow-x-auto">
//         <table className="mt-4 w-full">
//           <tbody>
//             <tr className="bg-gray-200 border-b border-gray-400">
//               <td className="p-2 pr-8">Name</td>
//               <td className="p-2 pr-8">x</td>
//               <td className="p-2 pr-8">y</td>
//               <td className="p-2 pr-8">z</td>
//               <td className="p-2 pr-8">w</td>
//             </tr>
//             {
//             attitudesState.map((attitude) => (
//               <tr className="text-gray-700 border-b border-gray-400" key={attitude.name}>
//                 <td className="p-2 pr-8">{attitude.name}</td>
//                 <td className="p-2 pr-8">
//                   {attitude.quaternions.d && attitude.quaternions.d.x
//                     ? attitude.quaternions.d.x : '-'}
//                 </td>
//                 <td className="p-2 pr-8">
//                   {attitude.quaternions.d && attitude.quaternions.d.y
//                     ? attitude.quaternions.d.y : '-'}
//                 </td>
//                 <td className="p-2 pr-8">
//                   {attitude.quaternions.d && attitude.quaternions.d.z
//                     ? attitude.quaternions.d.z : '-'}
//                 </td>
//                 <td className="p-2 pr-8">
//                   {attitude.quaternions.d && attitude.quaternions.w
//                     ? attitude.quaternions.w : '-'}
//                 </td>
//               </tr>
//             ))
//           }
//           </tbody>
//         </table>
//       </div>
//     </>
//   );
// }

// ThreeD.propTypes = {
//   /** Name of the component to display at the time */
//   name: PropTypes.string,
//   /** Currently displayed attitudes */
//   attitudes: PropTypes.arrayOf(
//     PropTypes.shape({
//       name: PropTypes.string,
//       nodeProcess: PropTypes.string,
//     }),
//   ),
//   /** Whether to show a circular indicator of the status of the component */
//   showStatus: PropTypes.bool,
//   /** The type of badge to show if showStatus is true (see the ant design badges component) */
//   status: ({ showStatus }, propName, componentName) => {
//     if (showStatus) {
//       return new Error(
//         `${propName} is required when showStatus is true in ${componentName}.`,
//       );
//     }

//     return null;
//   },
// };

// ThreeD.propTypes = {
//   
// };

// ThreeD.defaultProps = {
//   name: '',
//   attitudes: [],
//   showStatus: false,
//   status: 'error',
// };

// export default ThreeD;
