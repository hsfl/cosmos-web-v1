import { useCallback } from 'react';
import {
  ArcRotateCamera, AssetsManager,
  Color3, Color4, DynamicTexture,
  HemisphericLight, Mesh, MeshBuilder,
  StandardMaterial, Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders';

// Predefine some colors for extra vectors
const presetColors = [
  [1, 0, 0, 1], // Red
  [0.039, 0.729, 1, 1], // Light blue
  [1, 0.686, 0.039, 1], // Orange
  // ... make more as needed
];

const AttitudeSceneInitializer = (cubesatMesh, ...vectors) => {
  const onSceneReady = useCallback((scene) => {
    const sceneRef = scene;
    const assetsManager = new AssetsManager(sceneRef);

    const makeTextPlane = (text, color, size) => {
      const dynamicTexture = new DynamicTexture('DynamicTexture', 50, sceneRef, true);
      dynamicTexture.hasAlpha = true;
      dynamicTexture.drawText(text, 5, 40, 'bold 10px Arial', color, 'transparent', true);
      const plane = new Mesh.CreatePlane('TextPlane', size, sceneRef, true);
      plane.material = new StandardMaterial('TextPlaneMaterial', sceneRef);
      plane.material.backFaceCulling = false;
      plane.material.diffuseTexture = dynamicTexture;
      return plane;
    };

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

    // Reusable satellite axis settings
    const satAxisSettings = {
      height: 50,
      diameterTop: 0.006,
      diameterBottom: 0.006,
      tessellation: 10,
    };

    const satArrowSettings = {
      height: 0.1,
      diameterTop: 0,
      diameterBottom: 0.1,
      tessellation: 10,
    };

    const vectorSettings = {
      height: 0.3,
      diameterTop: 0.006,
      diameterBottom: 0.006,
      tessellation: 10,
    };

    const vectorArrowSettings = {
      height: 0.05,
      diameterTop: 0,
      diameterBottom: 0.03,
    };

    // note: babylonjs uses a left-handed coordinate system
    // babylonjs ignores rotation in favor of rotationQuaternion if the latter
    // is set, so if in the future we want to change the orientation of
    // the coordinate system itself (in reference to something provided)
    // then change according to whatever the reference system is using.

    // cylindrical x axis
    const satAxisX = MeshBuilder.CreateCylinder('satAxisX', {
      ...satAxisSettings,
      faceColors: [
        new Color4(1, 0, 0, 1),
        new Color4(1, 0, 0, 1),
        new Color4(1, 0, 0, 1),
      ],
    }, sceneRef);
    // create x axis arrow head
    const satArrowX = MeshBuilder.CreateCylinder('satArrowX', {
      ...satArrowSettings,
      faceColors: [
        new Color4(1, 0, 0, 1),
        new Color4(1, 0, 0, 1),
        new Color4(1, 0, 0, 1),
      ],
    }, sceneRef);
    satAxisX.position = new Vector3(0, satAxisSettings.height / 2, 0);
    satArrowX.position = new Vector3(0, 1, 0);
    satArrowX.setParent(satAxisX);
    satAxisX.setPivotPoint(new Vector3(0, -satAxisSettings.height / 2, 0));
    satAxisX.rotation = new Vector3(0, 0, 3 * Math.PI / 2);

    // cylindrical y axis
    const satAxisY = MeshBuilder.CreateCylinder('satAxisY', {
      ...satAxisSettings,
      faceColors: [
        new Color4(0, 1, 0, 1),
        new Color4(0, 1, 0, 1),
        new Color4(0, 1, 0, 1),
      ],
    }, sceneRef);
    // create y axis arrow head
    const satArrowY = MeshBuilder.CreateCylinder('satArrowY', {
      ...satArrowSettings,
      faceColors: [
        new Color4(0, 1, 0, 1),
        new Color4(0, 1, 0, 1),
        new Color4(0, 1, 0, 1),
      ],
    }, sceneRef);
    satAxisY.position = new Vector3(0, satAxisSettings.height / 2, 0);
    satArrowY.position = new Vector3(0, 1, 0);
    satArrowY.setParent(satAxisY);
    satAxisY.setPivotPoint(new Vector3(0, -satAxisSettings.height / 2, 0));

    // cylindrical z axis
    const satAxisZ = MeshBuilder.CreateCylinder('satAxisZ', {
      ...satAxisSettings,
      faceColors: [
        new Color4(0, 0, 1, 1),
        new Color4(0, 0, 1, 1),
        new Color4(0, 0, 1, 1),
      ],
    }, sceneRef);
    // create arrow for x axis at (0,0,1)
    const satArrowZ = MeshBuilder.CreateCylinder('satArrowZ', {
      ...satArrowSettings,
      faceColors: [
        new Color4(0, 0, 1, 1),
        new Color4(0, 0, 1, 1),
        new Color4(0, 0, 1, 1),
      ],
    }, sceneRef);
    satAxisZ.position = new Vector3(0, satAxisSettings.height / 2, 0);
    satArrowZ.position = new Vector3(0, 1, 0);
    satArrowZ.setParent(satAxisZ);
    satAxisZ.setPivotPoint(new Vector3(0, -satAxisSettings.height / 2, 0));
    satAxisZ.rotation = new Vector3(-3 * Math.PI / 2, 0, 0);

    const XCoordText = makeTextPlane('X', 'red', 1);
    XCoordText.position = new Vector3(1.1, 0, -0.1);

    const YCoordText = makeTextPlane('Y', 'green', 1);
    YCoordText.position = new Vector3(0.05, 0.9, 0);

    const ZCoordText = makeTextPlane('Z', 'blue', 1);
    ZCoordText.position = new Vector3(0, 0.05, 0.9);

    // Wireframe Attitude sphere
    /* const wireframe = new StandardMaterial('wireframe', sceneRef);
    wireframe.wireframe = true;
    wireframe.diffuseColor = new Color3(0.56, 0.12, 1);
    const attitudeSphere = Mesh.CreateSphere('attitudeSphere', 10, 1, sceneRef);
    attitudeSphere.material = wireframe; */

    // Optional Vectors such as vector to target
    vectors.forEach((v, i) => {
      // thin cylinder for vector
      const vec = MeshBuilder.CreateCylinder(`vector_${i}`, {
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
      vec.setPivotPoint(new Vector3(0, -vectorSettings.height / 2, 0));

      const vref = v;
      vref.current = vec;
    });

    // load in satellite obj file
    const addCubeSatTask = assetsManager.addMeshTask('CUBESAT', '', '/', 'cubesat.obj');
    addCubeSatTask.onSuccess = (task) => {
      const cref = cubesatMesh;
      [cref.current] = task.loadedMeshes;
    };
    assetsManager.load();
  }, [cubesatMesh]);

  return onSceneReady;
};

export default AttitudeSceneInitializer;
