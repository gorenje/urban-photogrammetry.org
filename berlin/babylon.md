---
title: 3D Tour
permalink: /berlin/babylon
layout: 3dtour
---

<script src="/f/bjs/babylon.js"></script>
<script src="/f/bjs/babylonjs.materials.min.js"></script>
<script src="/f/bjs/babylonjs.proceduralTextures.min.js"></script>
<script src="/f/bjs/babylonjs.postProcess.min.js"></script>
<script src="/f/bjs/babylonjs.loaders.js"></script>
<script src="/f/bjs/babylonjs.serializers.min.js"></script>
<script src="/f/bjs/babylon.gui.min.js"></script>


<script>
  function replaceTextureOnSkyBox(material) {
    material.backFaceCulling = false;
    material.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    material.microSurface = 1.0;
    material.disableLighting = true;
  }

  BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = function () {
      if (document.getElementById("customLoadingScreenDiv")) {
          // Do not add a loading screen if there is already one
          document.getElementById("customLoadingScreenDiv").style.display = "initial";
          return;
      }
      this._loadingDiv = document.createElement("div");
      this._loadingDiv.id = "customLoadingScreenDiv";
      this._loadingDiv.innerHTML = "<span>loading...</span>";
      var customLoadingScreenCss = document.createElement('style');
      customLoadingScreenCss.type = 'text/css';
    customLoadingScreenCss.innerHTML = `
    #customLoadingScreenDiv{

        display: flex;
        justify-content: center;
        align-items: center;

        min-height: 200px;
        padding: 20px;
        background-color: #000000;
        color: white;
        font-size:50px;
    }
    `;
      document.getElementsByTagName('head')[0].appendChild(customLoadingScreenCss);
      this._resizeLoadingUI();
      window.addEventListener("resize", this._resizeLoadingUI);
      document.body.appendChild(this._loadingDiv);
  };

  BABYLON.DefaultLoadingScreen.prototype.hideLoadingUI = function(){
      document.getElementById("customLoadingScreenDiv").style.display = "none";
  }


  var canvas = document.getElementById("3dcanvas");
  var alltextures = []
  var tstamp = Date.now();
  var engine = null;
  var scene = null;
  var multimat = null
  var sceneToRender = null;
  var prevMesh = null;
  var createDefaultEngine = function() {
    return new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: false});
  };

  var delayCreateScene = function () {
            // Create a scene.
    var scene = new BABYLON.Scene(engine);
    BABYLON.SceneLoader.ShowLoadingScreen = true;

    var skyboxMesh = BABYLON.Mesh.CreateBox("hdrSkyBox64", 1000.0, scene);
    skyboxMesh.infiniteDistance = true;

    multimat = new BABYLON.MultiMaterial("multi", scene);
    skyboxMesh.material = multimat

    var sizes = [64, 128, 256, 512, 1024]

    for ( var idx = 0; idx < 1; idx++ ) {
      var sze = sizes[idx];
      var txt = new BABYLON.EquiRectangularCubeTexture('/m/background-'+sze+'.png',
                                                       scene, sze);
      var mat = new BABYLON.PBRMaterial("skyBox"+sze, scene);
      mat.reflectionTexture = txt
      replaceTextureOnSkyBox(mat)
      multimat.subMaterials.push(mat)
      alltextures.push(txt)
    }


    BABYLON.SceneLoader.Append("/m/", "model-512.glb", scene, function (scene) {
      // console.log( scene.meshes)
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

      scene.meshes[2].onLODLevelSelection = function(num,mesh,selectedMesh) {
        var idx = 0

        if ( selectedMesh == prevMesh ) return;
        prevMesh = selectedMesh;

        // console.log( typeof(alltextures) + " " + alltextures.length )
        if ( typeof(alltextures) == 'undefined' ||  alltextures.length < 4 ) return;

        if ( (Date.now() - tstamp) < 10000 ) return

        if ( num < 1 ) { idx = 0 }
        if ( num > 1 && num < 3 && alltextures[1].isReady() ) { idx = 1 }
        if ( num > 3 && num < 4 && alltextures[2].isReady() ) { idx = 2 }
        if ( num > 4 && num < 5 && alltextures[3].isReady() ) { idx = 3 }
        if ( num > 5 && alltextures[4].isReady() ) { idx = 4 }
        // console.log( idx )

        new BABYLON.SubMesh(idx, 0, skyboxMesh.getTotalVertices(),
                            0, skyboxMesh.getTotalIndices(),
                            skyboxMesh);
      }

      BABYLON.SceneLoader.ImportMeshAsync("", "/m/","model-1k.glb",scene).then(
        function(mesh) {
          scene.meshes[2].addLODLevel(20,scene.meshes[2].clone())
          scene.meshes[2].addLODLevel(15,mesh.meshes[1])
          BABYLON.SceneLoader.ImportMeshAsync("", "/m/","model-2k.glb",scene).then(
            function(mesh) {
              scene.meshes[2].addLODLevel(5,mesh.meshes[1])
              BABYLON.SceneLoader.ImportMeshAsync("", "/m/","model-4k.glb",scene).then(function(mesh) {
                scene.meshes[2].addLODLevel(3,mesh.meshes[1])
                BABYLON.SceneLoader.ImportMeshAsync("", "/m/","model-8k.glb",scene).then(function(mesh) {
                  scene.meshes[2].addLODLevel(0,mesh.meshes[1])
                  for ( var idx = 1; idx < sizes.length; idx++ ) {
                    var sze = sizes[idx];
                    var txt = new BABYLON.EquiRectangularCubeTexture('/m/background-'+sze+'.png',
                                                                     scene, sze);
                    var mat = new BABYLON.PBRMaterial("skyBox"+sze, scene);
                    mat.reflectionTexture = txt
                    replaceTextureOnSkyBox(mat)
                    multimat.subMaterials.push(mat)
                    alltextures.push(txt)
                  }
                })
              })
            })
        })
    });

    return scene;
  };

  window.initFunction = async function() {
    var asyncEngineCreation = async function() {
      try {
        return createDefaultEngine();
      } catch(e) {
        console.log("the available createEngine function failed. Creating the default engine instead");
        return createDefaultEngine();
      }
    }

    window.engine = await asyncEngineCreation();

    if (!engine) throw 'engine should not be null.';

    window.scene = delayCreateScene();
  };

  initFunction().then(() => {
    sceneToRender = scene
    engine.runRenderLoop(function () {
      if (sceneToRender && sceneToRender.activeCamera) {
        sceneToRender.render();
      }
    });
  });

  window.addEventListener("resize", function () {
    engine.resize();
  });
</script>
