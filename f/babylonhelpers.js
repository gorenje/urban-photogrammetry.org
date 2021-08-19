function replaceTextureOnSkyBox(material) {
  material.backFaceCulling = false;
  material.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
  material.microSurface = 1.0;
  material.disableLighting = true;
}

var keybrdObserver = null;
function addKeyboardObserver(scene, skyboxMesh) {
  if ( keybrdObserver != null ) scene.onKeyboardObservable.remove(keybrdObserver)

  keybrdObserver = scene.onKeyboardObservable.add((kbInfo) => {
		switch (kbInfo.type) {
		case BABYLON.KeyboardEventTypes.KEYDOWN:
			switch (kbInfo.event.key) {
      case "1":
        new BABYLON.SubMesh(0, 0, skyboxMesh.getTotalVertices(),
                            0, skyboxMesh.getTotalIndices(),
                            skyboxMesh);
        break
      case "2":
        new BABYLON.SubMesh(1, 0, skyboxMesh.getTotalVertices(),
                            0, skyboxMesh.getTotalIndices(),
                            skyboxMesh);
        break
      case "3":
        new BABYLON.SubMesh(2, 0, skyboxMesh.getTotalVertices(),
                            0, skyboxMesh.getTotalIndices(),
                            skyboxMesh);
        break
      case "4":
        new BABYLON.SubMesh(3, 0, skyboxMesh.getTotalVertices(),
                            0, skyboxMesh.getTotalIndices(),
                            skyboxMesh);
        break
      }
			break;
		}})
}

function loadSkyBoxMaterial(mlid,sze,alltextures,multimat,scene) {
  var txt = new BABYLON.EquiRectangularCubeTexture('/m/' + mlid +
                                                   '/background-' +
                                                   sze + '.jpg',
                                                   scene, sze);
  var mat = new BABYLON.PBRMaterial("skyBox"+sze, scene);

  mat.reflectionTexture = txt
  replaceTextureOnSkyBox(mat)
  multimat.subMaterials.push(mat)
  alltextures.push(txt)
}

var cameraInitialised = false;
function initCamera(scene) {
  if ( cameraInitialised ) return;

  scene.createDefaultCameraOrLight(true, true, true);

  scene.activeCamera.alpha += Math.PI;

  var camera = scene.activeCamera;

  camera.useFramingBehavior = true;

  var framingBehavior = camera.getBehaviorByName("Framing");
  framingBehavior.framingTime = 0;
  framingBehavior.elevationReturnTime = -1;

  camera.lowerRadiusLimit = null;

  var worldExtends = scene.getWorldExtends(function (mesh) {
    return mesh.isVisible && mesh.isEnabled();
  });
  framingBehavior.zoomOnBoundingInfo(worldExtends.min, worldExtends.max);

  camera.pinchPrecision = 200 / camera.radius;
  camera.upperRadiusLimit = 5 * camera.radius;

  camera.wheelDeltaPercentage = 0.01;
  camera.pinchDeltaPercentage = 0.01;
  // camera.zoomToMouseLocation = true;
  // camera.checkCollisions = false;
  camera.minZ = 0.001;
  camera.attachControl(true);

  cameraInitialised = true;
}

function createSkyBox(scene) {
  var skyboxMesh = BABYLON.Mesh.CreateBox("hdrSkyBox64", 1000.0, scene);
  skyboxMesh.infiniteDistance = true;

  var multimat = new BABYLON.MultiMaterial("multi", scene);
  skyboxMesh.material = multimat

  return [skyboxMesh, multimat]
}

function loadModel(mlid, scene, skyboxMesh, multimat, sizes) {
  BABYLON.SceneLoader.Append("/m/"+mlid+"/", "model-512.glb", scene, function (scene) {

    initCamera(scene)
    modelMesh = scene.meshes[2];

    // setup the differenet skybox materials for the LOD Level, i.e. as
    // you zoom in, the skybox loses details. As you zoom out, you gain
    // details in the skybox.
    modelMesh.onLODLevelSelection = function(num,mesh,selectedMesh) {
      var idx = 0

      if ( (Date.now() - startTimeStamp) < 15000 ) return;

      if ( selectedMesh == prevLODMesh ) return;
      prevLODMesh = selectedMesh;

      if ( typeof(alltextures) == 'undefined' ||  alltextures.length < 2 ) return;

      if ( num < 3 ) { idx = 0 }
      if ( num >= 3 && num < 6 && alltextures[1].isReady() ) { idx = 1 }
      if ( num >= 6 && num < 8 && alltextures[2].isReady() ) { idx = 2 }
      if ( num >= 8            && alltextures[3].isReady() ) { idx = 3 }

      // console.log(num + " --> " + idx + " [ " + selectedMesh.name)

      new BABYLON.SubMesh(idx, 0, skyboxMesh.getTotalVertices(),
                          0, skyboxMesh.getTotalIndices(),
                          skyboxMesh);
    }

    // Load the various LODs for the model and once they are all loaded,
    // loaed all the materials for the skybox.
    BABYLON.SceneLoader.ImportMeshAsync("", "/m/"+mlid+"/","model-2k.glb",scene).then(
      function(mesh) {
        modelMesh.addLODLevel(20,modelMesh.clone())
        modelMesh.addLODLevel(6,mesh.meshes[1])
        BABYLON.SceneLoader.ImportMeshAsync("", "/m/"+mlid+"/","model-4k.glb",scene).then(
          function(mesh) {
            modelMesh.addLODLevel(3,mesh.meshes[1])
            BABYLON.SceneLoader.ImportMeshAsync("", "/m/"+mlid+"/","model-8k.glb",scene).then(function(mesh) {
              modelMesh.addLODLevel(0,mesh.meshes[1])
              for ( var idx = 1; idx < sizes.length; idx++ ) {
                loadSkyBoxMaterial(mlid,sizes[idx],alltextures,multimat,scene)
              }
            })
          })
      })
  });
}
