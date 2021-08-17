import { useCallback } from 'react';
import {
  ArcRotateCamera, AssetsManager,
  Color3, Color4, DynamicTexture,
  HemisphericLight, Mesh,
  Quaternion, StandardMaterial, Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders';

// Predefine some colors for extra vectors
const presetColors = [
  [0.039, 0.729, 1, 1], // Light blue, for Nadir
  [1, 0.686, 0.039, 1], // Orange, for Target
  [1, 1, 0.121, 1], // Yellow, for Desired target
  [0, 0.521, 0.043, 1], // Dark green, for velocity
  // ... make more as needed
];

const AttitudeSceneInitializer = (cubesatMesh, satVectors) => {
  const onSceneReady = useCallback((scene) => {
    const sceneRef = scene;
    const assetsManager = new AssetsManager(sceneRef);

    /* const makeTextPlane = (text, color, size) => {
      const dynamicTexture = new DynamicTexture('DynamicTexture', 50, sceneRef, true);
      dynamicTexture.hasAlpha = true;
      dynamicTexture.drawText(text, 5, 40, 'bold 10px Arial', color, 'transparent', true);
      const plane = new Mesh.CreatePlane('TextPlane', size, sceneRef, true);
      plane.material = new StandardMaterial('TextPlaneMaterial', sceneRef);
      plane.material.backFaceCulling = false;
      plane.material.diffuseTexture = dynamicTexture;
      return plane;
    }; */

    sceneRef.clearColor = new Color3(0.15, 0.15, 0.15);

    // create a basic light, aiming 0,10,0 - meaning, to the sky
    const light1 = new HemisphericLight('light1', new Vector3(0, 10, 0), sceneRef);
    const light2 = new HemisphericLight('light2', new Vector3(0, -10, 0), sceneRef);
    light1.intensity = 1;
    light2.intensity = 1;

    const engine = sceneRef.getEngine();
    const canvas = engine.getRenderingCanvas();

    /**
     * CAMERA
     */
    // create arc rotate camera at initial arc pi/4 pi/4 at radius 20 centered around (0,0,0)
    const camera = new ArcRotateCamera('ArcRotateCamera', Math.PI / 4, Math.PI / 4, 3, new Vector3(0, 0, 0), sceneRef, true);

    camera.fov = 0.2;

    // attach the camera to the canvas
    camera.attachControl(canvas, false);

    // Camera zoom speed
    camera.wheelPrecision = 200;

    /**
     * AXES
     */
    /* const vectorSettings = {
      height: 0.3,
      diameterTop: 0.006,
      diameterBottom: 0.006,
      tessellation: 10,
    };

    const vectorArrowSettings = {
      height: 0.05,
      diameterTop: 0,
      diameterBottom: 0.03,
    }; */

    // note: babylonjs uses a left-handed coordinate system
    // babylonjs ignores rotation in favor of rotationQuaternion if the latter
    // is set, so if in the future we want to change the orientation of
    // the coordinate system itself (in reference to something provided)
    // then change according to whatever the reference system is using.

    const showWorldAxis = (size) => {
      const makeTextPlane = (text, color) => {
        const dynamicTexture = new DynamicTexture('DynamicTexture', 50, sceneRef, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, 5, 40, 'bold 36px Arial', color, 'transparent', true);
        const plane = Mesh.CreatePlane('TextPlane', size, sceneRef, true);
        plane.material = new StandardMaterial('TextPlaneMaterial', sceneRef);
        plane.material.backFaceCulling = false;
        plane.material.specularColor = new Color3(0, 0, 0);
        plane.material.diffuseTexture = dynamicTexture;
        return plane;
      };
      const axisX = Mesh.CreateLines('axisX', [
        Vector3.Zero(), new Vector3(size, 0, 0), new Vector3(size * 0.95, 0.05 * size, 0),
        new Vector3(size, 0, 0), new Vector3(size * 0.95, -0.05 * size, 0),
      ], sceneRef);
      axisX.color = new Color3(1, 0, 0);
      const xChar = makeTextPlane('X', 'red', size / 10);
      xChar.position = new Vector3(0.9 * size, -0.05 * size, 0);
      const axisY = Mesh.CreateLines('axisY', [
        Vector3.Zero(), new Vector3(0, size, 0), new Vector3(-0.05 * size, size * 0.95, 0),
        new Vector3(0, size, 0), new Vector3(0.05 * size, size * 0.95, 0),
      ], sceneRef);
      axisY.color = new Color3(0, 1, 0);
      const yChar = makeTextPlane('Y', 'green', size / 10);
      yChar.position = new Vector3(0, 0.9 * size, -0.05 * size);
      const axisZ = Mesh.CreateLines('axisZ', [
        Vector3.Zero(), new Vector3(0, 0, size), new Vector3(0, -0.05 * size, size * 0.95),
        new Vector3(0, 0, size), new Vector3(0, 0.05 * size, size * 0.95),
      ], sceneRef);
      axisZ.color = new Color3(0, 0, 1);
      const zChar = makeTextPlane('Z', 'blue', size / 10);
      zChar.position = new Vector3(0, 0.05 * size, 0.9 * size);
    };

    showWorldAxis(0.5);

    // Wireframe Attitude sphere
    /* const wireframe = new StandardMaterial('wireframe', sceneRef);
    wireframe.wireframe = true;
    wireframe.diffuseColor = new Color3(0.56, 0.12, 1);
    const attitudeSphere = Mesh.CreateSphere('attitudeSphere', 10, 1, sceneRef);
    attitudeSphere.material = wireframe; */

    // Vectors such as vector to target
    const svRef = satVectors;
    for (let i = 0; i < svRef.length; i += 1) {
      // thin cylinder for vector
      /* const vec = MeshBuilder.CreateCylinder(`vector_${i}`, {
        ...vectorSettings,
        faceColors: [
          new Color4(...presetColors[i]),
          new Color4(...presetColors[i]),
          new Color4(...presetColors[i]),
        ],
      }, sceneRef);
      // arrow head
      const arrow = MeshBuilder.CreateCylinder(`arrow_${i}`, {
        ...vectorArrowSettings,
        faceColors: [
          new Color4(...presetColors[i]),
          new Color4(...presetColors[i]),
          new Color4(...presetColors[i]),
        ],
      }, sceneRef);
      vec.position = new Vector3(0, vectorSettings.height / 2, 0);
      arrow.position = new Vector3(0, vectorSettings.height, 0);
      arrow.setParent(vec);
      vec.setPivotPoint(new Vector3(0, -vectorSettings.height / 2, 0)); */
      const points = [Vector3.Zero(), new Vector3(0, 0, 5)];
      const vec = Mesh.CreateLines(`vector_${i}`, points, sceneRef, true);
      vec.color = new Color4(...presetColors[i]);
      vec.rotationQuaternion = Quaternion.Zero();
      svRef[i].current = vec;
    }

    // load in satellite obj file
    const addCubeSatTask = assetsManager.addMeshTask('CUBESAT', '', '/', 'cubesat.obj');
    addCubeSatTask.onSuccess = (task) => {
      const cref = cubesatMesh;
      [cref.current] = task.loadedMeshes;
    };
    assetsManager.load();
  }, [cubesatMesh, satVectors]);

  return onSceneReady;
};

export default AttitudeSceneInitializer;
