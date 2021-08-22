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
          case "5":
            var camera = scene.activeCamera;
            camera.position = new BABYLON.Vector3(0,2*Math.PI,0)
            camera.target   = new BABYLON.Vector3(0,0,0)
            camera.alpha    = 0
            camera.beta     = 0
            camera.radius   = 2 * Math.PI
            break
          case "6":
            var camera = scene.activeCamera;
            camera.position = new BABYLON.Vector3(0,-2*Math.PI,0)
            camera.target   = new BABYLON.Vector3(0,0,0)
            camera.alpha    = 0
            camera.beta     = Math.PI
            camera.radius   = 2 * Math.PI
            break
          case "7":
            var camera = scene.activeCamera;
            camera.position = new BABYLON.Vector3(0,0,0)
            camera.target   = new BABYLON.Vector3(0,0,0)
            camera.alpha    = 0
            camera.beta     = Math.PI / 2
            camera.radius   = 0
            break
        }
			  break;
		}})
}

// register the fader for transistions between models.
var ppFactor = -0.01;
var ppFadeLevel = 1.0;
var fadeOutCb = function(){};
var stop_transition = true;
var frameCounter = 0;

function initScene(scene) {
	var postProcess = new BABYLON.PostProcess("Fade", "fade", ["fadeLevel"],
                                                null, 1.0, scene.activeCamera);
	postProcess.onApply = (effect) => {
   	effect.setFloat("fadeLevel", ppFadeLevel);
  };
  scene.registerBeforeRender(function () {
    frameCounter++;
    if ( !stop_transition ) {
		  ppFadeLevel += ppFactor;
      if ( ppFadeLevel > 1 ) {
        stop_transition = true;
      }
      if ( ppFadeLevel < 0 ) {
        stop_transition = true;
        fadeOutCb()
        ppFactor = 0.01
      }
    }
  })
}

function prepareAnimations(frameRate) {
  return [
    new BABYLON.Animation(
      "movein",
      "position",
      frameRate,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    ),
    new BABYLON.Animation(
      "alpha",
      "alpha",
      frameRate,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    ),
    new BABYLON.Animation(
      "beta",
      "beta",
      frameRate,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    ),
    new BABYLON.Animation(
      "radius",
      "radius",
      frameRate,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    ),
    new BABYLON.Animation(
      "targetting",
      "target",
      frameRate,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    ),
  ]
}

function vector3FromHash(hsh) {
  return new BABYLON.Vector3(hsh.x || hsh.X, hsh.y || hsh.Y, hsh.z || hsh.Z)
}

function prepareFadeOut(func) {
  ppFadeLevel = 1.0;
  ppFactor = -0.01;
  stop_transition = false;
  fadeOutCb = func;
}

function configMaterial(material) {
  material.backFaceCulling = false;
  material.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
  material.microSurface = 1.0;
  material.disableLighting = true;
}

function loadSkyBoxMaterial(mlid,sze,alltextures,multimat,scene) {
  var filename = '/m/' + mlid +'/background-' + sze + '.jpg';
  var cacheEntry = ModelCache.getEntry(filename)
  if ( cacheEntry != undefined ) { filename = cacheEntry; }

  var txt = new BABYLON.EquiRectangularCubeTexture(filename, scene, sze);
  var mat = new BABYLON.StandardMaterial("skyBox"+sze, scene);

  mat.reflectionTexture = txt
  configMaterial(mat)
  multimat.subMaterials.push(mat)
  alltextures.push(txt)
}

function clearScene(scene, skyboxMesh, alltextures) {
  skyboxMesh.dispose()
  for ( var idx = 0; idx < scene.meshes.length; idx++ ) {
    scene.meshes[idx].dispose()
  }
  scene.meshes.length = 0
  alltextures.length = 0
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

  camera.onViewMatrixChangedObservable.add(() => {
    // console.log(camera.getViewMatrix())
  })

  initScene(scene)
  // try {
  //   new BABYLON.AsciiArtPostProcess("myAscii", camera, { font: '5px Monospace'});
  // } catch(e) {
  //   console.log(e)
  // }
  // try {
  //   new BABYLON.SharpenPostProcess("myAscii", 1.7, camera);
  // } catch(e) {
  //   console.log(e)
  // }
  cameraInitialised = true;
}

function createSkyBox(scene) {
  var skyboxMesh = BABYLON.Mesh.CreateBox("hdrSkyBox64", 1000.0, scene);
  skyboxMesh.infiniteDistance = true;

  var multimat = new BABYLON.MultiMaterial("multi", scene);
  skyboxMesh.material = multimat

  return [skyboxMesh, multimat]
}

var prevLODIdx = 0;
function loadModel(model, scene, skyboxMesh, multimat, sizes) {
  var mlid = model.mlid;
  var rotateFactor = model.rotate;
  var rootUrl = "/m/"+mlid+"/"
  var modelName = "model-512.glb"

  var cacheEntry = ModelCache.getEntry(rootUrl + modelName)
  if ( cacheEntry != undefined ) {
    rootUrl   = ""
    modelName = cacheEntry
  }

  scene.stopAllAnimations()

  BABYLON.SceneLoader.Append(rootUrl, modelName, scene, function (scene) {
    if (ppFadeLevel < 0) stop_transition = false;

    initCamera(scene, model)

    if ( model.camera != undefined ) {
      var camera = scene.activeCamera;
      camera.position = vector3FromHash(model.camera.position)
      camera.target   = vector3FromHash(model.camera.target)
      camera.alpha    = model.camera.alpha;
      camera.beta     = model.camera.beta;
      camera.radius   = model.camera.radius;
    }

    modelMesh = scene.meshes[2];
    modelMesh.rotate(new BABYLON.Vector3(0,1,0),
                     Math.PI * rotateFactor,
                     BABYLON.Space.WORLD )

    // setup the differenet skybox materials for the LOD Level, i.e. as
    // you zoom in, the skybox loses details. As you zoom out, you gain
    // details in the skybox.
    modelMesh.onLODLevelSelection = function(num,mesh,selectedMesh) {
      var idx = 0

      if ( typeof(alltextures) == 'undefined' ||  alltextures.length < 2 ) return;

      if ( num < 3 ) { idx = 0 }
      if ( num >= 3 && num < 6 && alltextures[1].isReady() ) { idx = 1 }
      if ( num >= 6 && num < 8 && alltextures[2].isReady() ) { idx = 2 }
      if ( num >= 8            && alltextures[3].isReady() ) { idx = 3 }

      if ( prevLODIdx != idx ) {
        new BABYLON.SubMesh(idx, 0, skyboxMesh.getTotalVertices(),
                            0, skyboxMesh.getTotalIndices(),
                            skyboxMesh);
        prevLODIdx = idx
      }
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
              ModelCache.cachePrevAndNext(mlid)
            })
          })
      })
  });
}
