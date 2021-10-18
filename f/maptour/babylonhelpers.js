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
var ppFactor = -0.02;
var ppFadeLevel = 1.0;
var fadeOutCb = function(){};
var stop_transition = true;
var frameCounter = 0;
var lastTenFps = new Array(10)

function initScene(scene) {
	var postProcess = new BABYLON.PostProcess("Fade", "fade", ["fadeLevel"],
                                                null, 1.0, scene.activeCamera);
	postProcess.onApply = (effect) => {
   	effect.setFloat("fadeLevel", ppFadeLevel);
  };
  scene.registerBeforeRender(function () {
    frameCounter++;
    lastTenFps[frameCounter % lastTenFps.length] = Math.ceil(
      scene.getEngine().getFps()
    )

    if ( !stop_transition ) {
		  ppFadeLevel += ppFactor;
      if ( ppFadeLevel > 1 ) {
        stop_transition = true;
      }
      if ( ppFadeLevel < 0 ) {
        stop_transition = true;
        fadeOutCb()
        ppFactor = 0.02
      }
    }
  })
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

  var txt = new BABYLON.EquiRectangularCubeTexture(
    filename, scene, sze, false, true, function(){
      var mat = new BABYLON.StandardMaterial("skyBox"+sze, scene);
      mat.reflectionTexture = txt
      configMaterial(mat)
      multimat.subMaterials.push(mat)
      alltextures.push(txt)
    })
}

function clearScene(scene, skyboxMesh, alltextures) {
  if ( skyboxMesh ) { skyboxMesh.dispose(false,true) }
  if ( multimat ) { multimat.dispose(true,true,true) }

  for ( var idx = 0; idx < scene.rootNodes.length; idx++ ) {
    if ( ["hdrSkyBox64", "__root__"].includes(scene.rootNodes[idx].id) ) {
      scene.rootNodes[idx].dispose(false,true)
    }
  }
  for ( var idx = 0; idx < scene.meshes.length; idx++ ) {
    scene.meshes[idx].dispose(false,true)
  }
  for ( var idx = 0; idx < scene.textures.length; idx++ ) {
    if ( !["data:EnvironmentBRDFTexture0", "UI"].includes(scene.textures[idx].name)) {
      scene.textures[idx].dispose()
    }
  }
  for ( var idx = 0; idx < scene.materials.length; idx++ ) {
    scene.materials[idx].dispose()
  }
  for ( var idx = 0; idx < scene.multiMaterials.length; idx++ ) {
    scene.multiMaterials[idx].dispose()
  }
  for ( var idx = 0; idx < alltextures.length; idx++ ) {
    alltextures[idx].dispose()
  }

  alltextures.length = 0
  scene.meshes.length = 0
  alltextures.length = 0
  skyboxMesh = undefined;
  multimat = undefined;
  scene.clearCachedVertexData()
  engine.clearInternalTexturesCache()
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

  //camera.pinchPrecision = 200 / camera.radius;
  camera.upperRadiusLimit = 5 * camera.radius;

  /* camera.wheelDeltaPercentage = 0.01;
   * camera.pinchDeltaPercentage = 0.01;*/
  camera.wheelPrecision = 130;
  camera.pinchPrecision = 130;
  // camera.zoomToMouseLocation = true;
  camera.checkCollisions = false;
  camera.minZ = 0.001;
  camera.attachControl(true);

  initScene(scene)
  cameraInitialised = true;
}

function createSkyBox(scene) {
  var skyboxMesh = BABYLON.Mesh.CreateSphere("hdrSkyBox64", 32, 300, scene);
  skyboxMesh.infiniteDistance = true;

  var multimat = new BABYLON.MultiMaterial("multi", scene);
  skyboxMesh.material = multimat

  return [skyboxMesh, multimat]
}

function isTextureReady(texture) {
  return texture != undefined && texture != null && texture.isReady()
}

function defineIntroAnim(model, scene) {
  return function() {
    var model = this;
    var camera = scene.activeCamera;
    var frameRate = Math.ceil(TDHelpers.average(lastTenFps)) || 30;
    var anims = TDHelpers.prepareAnimations(frameRate)
    var attrs = [ [], [], [], [], [] ]

    attrs[0].push({ frame: 0, value: camera.position.clone() })
    attrs[1].push({ frame: 0, value: camera.alpha })
    attrs[2].push({ frame: 0, value: camera.beta })
    attrs[3].push({ frame: 0, value: camera.radius })
    attrs[4].push({ frame: 0, value: camera.target.clone() })

    attrs[0].push({ frame: frameRate*2,
                    value: model.sharecamera.position.clone() })
    attrs[1].push({ frame: frameRate*2, value: model.sharecamera.alpha })
    attrs[2].push({ frame: frameRate*2, value: model.sharecamera.beta })
    attrs[3].push({ frame: frameRate*2, value: model.sharecamera.radius })
    attrs[4].push({ frame: frameRate*2,
                    value: model.sharecamera.target.clone() })

    $.each(anims, function( index, anim ) { anim.setKeys( attrs[index] ) })
    var anim = scene.beginDirectAnimation(camera,anims,0,2*frameRate,false);
    anim.disposeOnEnd = true

    if ( model.autoExitAfterAnim ) {
      anim.onAnimationEndObservable.addOnce(function() {
        TDHelpers.setupAutoExit(5000)
        anim = undefined
      })
      delete model.autoExitAfterAnim
    }
    delete model.sharecamera
  }.bind(model);
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
  currFlythrough = null;

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

      // don't update the LODlevel if we're doing a flythrough
      if ( currFlythrough !== null ) {return;}

      if (typeof(alltextures) == 'undefined' ||  alltextures.length < 2) return;

      if ( TDHelpers.isMobile() ) {
        if ( num < 3 ) { idx = 0 }
        if ( num >= 3 && isTextureReady(alltextures[1]) ) { idx = 1 }
      } else {
        if ( num < 3 ) { idx = 0 }
        if ( num >= 3 && num < 6 && isTextureReady(alltextures[1]) ) { idx = 1 }
        if ( num >= 6 && num < 8 && isTextureReady(alltextures[2]) ) { idx = 2 }
        if ( num >= 8            && isTextureReady(alltextures[3]) ) { idx = 3 }
      }

      if ( prevLODIdx != idx ) {
        new BABYLON.SubMesh(idx, 0, skyboxMesh.getTotalVertices(),
                            0, skyboxMesh.getTotalIndices(),
                            skyboxMesh);
        prevLODIdx = idx
      }
    }

    // Load the various LODs for the model and once they are all loaded,
    // loaed all the materials for the skybox.
    try {
      if ( TDHelpers.isMobile() ) {
        // non-desktop devices - only 2 levels of details.
        BABYLON.SceneLoader.ImportMeshAsync("", "/m/"+mlid+"/","model-1k.glb",scene).then(
          function(mesh) {
            var cMlid = mlid;
            mesh.meshes[1].setEnabled(false)

            if (cMlid == currModel.mlid) {
              modelMesh.addLODLevel(20,modelMesh.clone())
              mesh.meshes[1].setEnabled(true)
              modelMesh.addLODLevel(6,mesh.meshes[1])
            }

            BABYLON.SceneLoader.ImportMeshAsync("", "/m/"+mlid+"/","model-2k.glb",scene).then(
              function (mesh) {
                var cMlid = mlid;
                mesh.meshes[1].setEnabled(false)

                if (cMlid == currModel.mlid) {
                  mesh.meshes[1].setEnabled(true)
                  modelMesh.addLODLevel(3,mesh.meshes[1])
                }
                for ( var idx = 1; idx < 3; idx++ ) {
                  loadSkyBoxMaterial(mlid,sizes[idx],alltextures,multimat,scene)
                }
                setTimeout( function() {
                  ModelCache.cachePrevAndNext(this)
                }.bind(mlid), 1000)
              })
          })
      } else {
        // desktop devics get complete resolution and details.
        BABYLON.SceneLoader.ImportMeshAsync("", "/m/"+mlid+"/","model-2k.glb",scene).then(
          function(mesh) {
            var cMlid = mlid;
            mesh.meshes[1].setEnabled(false)

            if (cMlid == currModel.mlid) {
              modelMesh.addLODLevel(10,modelMesh.clone())
              mesh.meshes[1].setEnabled(true)
              modelMesh.addLODLevel(6,mesh.meshes[1])
            }

            BABYLON.SceneLoader.ImportMeshAsync("", "/m/"+mlid+"/","model-4k.glb",scene).then(
              function(mesh) {
                var cMlid = mlid;
                mesh.meshes[1].setEnabled(false)

                if (cMlid == currModel.mlid) {
                  mesh.meshes[1].setEnabled(true)
                  modelMesh.addLODLevel(3,mesh.meshes[1])
                }
                BABYLON.SceneLoader.ImportMeshAsync("", "/m/"+mlid+"/","model-6k.glb",scene).then(
                  function(mesh) {
                    var cMlid = mlid;
                    mesh.meshes[1].setEnabled(false)

                    // ensure mesh matches currently displayed mesh
                    if (cMlid == currModel.mlid) {
                      mesh.meshes[1].setEnabled(true)
                      modelMesh.addLODLevel(0.5,mesh.meshes[1])
                    }
                    for ( var idx = 1; idx < sizes.length; idx++ ) {
                      loadSkyBoxMaterial(mlid,
                                         sizes[idx],
                                         alltextures,
                                         multimat,
                                         scene)
                    }
                    setTimeout( function() {
                      ModelCache.cachePrevAndNext(this)
                    }.bind(mlid), 1000)
                  })
              })
          })
      }
    } catch ( e ) {
      console.log(e)
    }

    try { SoundsHelper.playModel(mlid) } catch ( e ) { console.log(e) }
  });
}
