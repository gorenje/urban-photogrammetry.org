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
<script src="/f/babylonhelpers.js"></script>


<script>
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
  var engine = null;
  var scene = null;
  var multimat = null
  var sceneToRender = null;
  var prevLODMesh = null;
  var startTimeStamp = Date.now();
  var skyboxMesh = null;
  var initMlid = "3d0f151bf808494a9eb1b2a81665e832"
  var baseMaterialSizes = [64, 256, 512, 1024]

  var createDefaultEngine = function() {
    return new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: false});
  };

  var delayCreateScene = function () {
    var scene = new BABYLON.Scene(engine);
    BABYLON.SceneLoader.ShowLoadingScreen = true;

    var r = createSkyBox(scene)
    skyboxMesh = r[0]
    multimat = r[1]

    loadSkyBoxMaterial(initMlid,baseMaterialSizes[0],alltextures,multimat,scene)

    addKeyboardObserver(scene, skyboxMesh);

    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    var button = BABYLON.GUI.Button.CreateSimpleButton("but", "Previous");
    button.width = "100px";
    button.height = "30px";
    button.color = "white";
    button.left = "-45%";
    button.top = "45%";
    button.background = "#22222255";
    button.cornerRadius = 20;
    button.onPointerClickObservable.add(function(b){
      // destruction
      skyboxMesh.dispose()
      skyboxMesh = null
      for ( var idx = 0; idx < scene.meshes.length; idx++ ) {
        scene.meshes[idx].dispose()
      }
      scene.meshes.length = 0
      alltextures.length = 0

      // restruction
      var mlid = initMlid;
      var r = createSkyBox(scene)
      skyboxMesh = r[0]
      multimat = r[1]
      startTimeStamp = Date.now();

      loadSkyBoxMaterial(mlid,baseMaterialSizes[0],alltextures,multimat,scene)
      addKeyboardObserver(scene, skyboxMesh);
      loadModel(mlid, scene, skyboxMesh, multimat, baseMaterialSizes)

    })
    advancedTexture.addControl(button);

    var button = BABYLON.GUI.Button.CreateSimpleButton("but", "Next");
    button.width = "100px";
    button.height = "30px";
    button.color = "white";
    button.left = "45%";
    button.top = "45%";
    button.background = "#22222255";
    button.cornerRadius = 20;
    button.onPointerClickObservable.add(function(b){
      // destruction
      skyboxMesh.dispose()
      skyboxMesh = null
      for ( var idx = 0; idx < scene.meshes.length; idx++ ) {
        scene.meshes[idx].dispose()
      }
      scene.meshes.length = 0
      alltextures.length = 0

      // restruction
      var mlid = "0ec35096975442188f5278665013bfae";
      var r = createSkyBox(scene)
      skyboxMesh = r[0]
      multimat = r[1]
      startTimeStamp = Date.now();

      loadSkyBoxMaterial(mlid,baseMaterialSizes[0],alltextures,multimat,scene)
      addKeyboardObserver(scene, skyboxMesh);
      loadModel(mlid, scene, skyboxMesh, multimat, baseMaterialSizes)
    })
    advancedTexture.addControl(button);

    var textBlock = new BABYLON.GUI.TextBlock()
    textBlock.text = `
      <a href='dd'>dads</a>
    `
    textBlock.isVisible = false;
    textBlock.width = "100px";
    textBlock.height = "300px";
    textBlock.color = "white";
    textBlock.left = "45%";
    textBlock.top = "-40%";
    textBlock.background = "red";
    textBlock.cornerRadius = 20;
    textBlock.fontSize = "10px"
    advancedTexture.addControl(textBlock);

    var button = BABYLON.GUI.Button.CreateSimpleButton("but", "Info");
    button.width = "100px";
    button.height = "30px";
    button.color = "white";
    button.left = "45%";
    button.top = "-45%";
    button.background = "#22222255";
    button.cornerRadius = 20;
    button.fontSize = "10px"
    button.onPointerClickObservable.add(function(b){
      textBlock.isVisible = !textBlock.isVisible;
    })
    advancedTexture.addControl(button);


    loadModel(initMlid, scene, skyboxMesh, multimat, baseMaterialSizes)

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
