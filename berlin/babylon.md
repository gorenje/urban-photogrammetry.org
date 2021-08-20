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
<script src="/f/models.js"></script>

<style type='text/css'>
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
</style>

<script>
  BABYLON.Effect.RegisterShader("fade", "precision highp float;" +
                                "varying vec2 vUV;" +
                                "uniform sampler2D textureSampler; " +
                                "uniform float fadeLevel; " +
                                "void main(void){" +
                                "vec4 baseColor = texture2D(textureSampler, vUV) * fadeLevel;" +
                                "baseColor.a = 1.0;" +
                                "gl_FragColor = baseColor;" + "}");

  BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = function () {
      if (document.getElementById("customLoadingScreenDiv")) {
          // Do not add a loading screen if there is already one
          document.getElementById("customLoadingScreenDiv").style.display = "initial";
          return;
      }
      this._loadingDiv = document.createElement("div");
      this._loadingDiv.id = "customLoadingScreenDiv";
      this._loadingDiv.innerHTML = "loading...";
      this._resizeLoadingUI();
      window.addEventListener("resize", this._resizeLoadingUI);
      document.body.appendChild(this._loadingDiv);
  };

  BABYLON.DefaultLoadingScreen.prototype.hideLoadingUI = function(){
    document.getElementById("customLoadingScreenDiv").style.display = "none";
    // if the loader screen is complete and we're in the middle of a fadeOut
    // then trigger the fadeIn again.
    if (ppFadeLevel < 0) stop_transition = false;
  }


  var canvas = document.getElementById("3dcanvas");
  var alltextures = []
  var engine = null;
  var scene = null;
  var multimat = null
  var sceneToRender = null;
  var skyboxMesh = null;
  var currModel = UPModels.init();
  var baseMaterialSizes = [64, 256, 512, 1024]
  var textBlock = null;

  var cameraPath = []

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

    loadSkyBoxMaterial(currModel.mlid,baseMaterialSizes[0],alltextures,multimat,scene)

    addKeyboardObserver(scene, skyboxMesh);

    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    var button = BABYLON.GUI.Button.CreateSimpleButton("but", "<<<");
    button.width = "100px";
    button.height = "30px";
    button.color = "white";
    button.left = "-45%";
    button.top = "45%";
    button.background = "#22222255";
    button.cornerRadius = 20;
    button.onPointerClickObservable.add(function(b){
      prepareFadeOut(function() {
        // destruction
        clearScene(scene, skyboxMesh, alltextures)

        // restruction
        currModel      = UPModels.previous(currModel)
        var r          = createSkyBox(scene)
        skyboxMesh     = r[0]
        multimat       = r[1]
        startTimeStamp = Date.now();
        textBlock.text = currModel.text;

        loadSkyBoxMaterial(currModel.mlid, baseMaterialSizes[0],
                           alltextures, multimat,scene)
        addKeyboardObserver(scene, skyboxMesh);
        loadModel(currModel.mlid, currModel.rotate, scene,
                  skyboxMesh, multimat, baseMaterialSizes)
      })
    })
    advancedTexture.addControl(button);

    var button = BABYLON.GUI.Button.CreateSimpleButton("but", ">>>");
    button.width = "100px";
    button.height = "30px";
    button.color = "white";
    button.left = "45%";
    button.top = "45%";
    button.background = "#22222255";
    button.cornerRadius = 20;
    button.onPointerClickObservable.add(function(b){
      prepareFadeOut(function() {
	      // destruction
        clearScene(scene, skyboxMesh, alltextures)

        // restruction
        currModel      = UPModels.next(currModel)
        var r          = createSkyBox(scene)
        skyboxMesh     = r[0]
        multimat       = r[1]
        startTimeStamp = Date.now();
        textBlock.text = currModel.text;

        loadSkyBoxMaterial(currModel.mlid, baseMaterialSizes[0],
                           alltextures, multimat,scene)
        addKeyboardObserver(scene, skyboxMesh);
        loadModel(currModel.mlid, currModel.rotate, scene,
                  skyboxMesh, multimat, baseMaterialSizes)
      })
    })
    advancedTexture.addControl(button);

    textBlock = new BABYLON.GUI.TextBlock()
    textBlock.text = currModel.text;
    textBlock.isVisible = false;
    textBlock.width = "300px";
    textBlock.height = "300px";
    textBlock.color = "white";
    textBlock.left = "45%";
    textBlock.top = "-40%";
    textBlock.background = "red";
    textBlock.cornerRadius = 20;
    textBlock.fontSize = "10px"
    advancedTexture.addControl(textBlock);

    var button = BABYLON.GUI.Button.CreateSimpleButton("but", "&#128712;");
    button.width = "100px";
    button.height = "30px";
    button.color = "white";
    button.left = "0%";
    button.top = "45%";
    button.background = "#22222255";
    button.cornerRadius = 20;
    button.fontSize = "10px"
    button.onPointerClickObservable.add(function(b){
      textBlock.isVisible = !textBlock.isVisible;
    })
    advancedTexture.addControl(button);

    var button = BABYLON.GUI.Button.CreateSimpleButton("but", "play");
    button.width = "100px";
    button.height = "30px";
    button.color = "white";
    button.left = "45%";
    button.top = "0%";
    button.background = "#22222255";
    button.cornerRadius = 20;
    button.onPointerClickObservable.add(function(b){
      console.log( "play button pressed" )
      try {
        var camera = scene.activeCamera;
        var frameRate = 20;
        var pathDump = [];

        var anims = [
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
        ]

        var attrs = [ [], [], [], [] ];

        var startFrame = cameraPath[0].frame;
        var lastFrame = 0;

        for ( var idx = 0; idx < cameraPath.length; idx++ ) {
          var dp = cameraPath[idx]
          var frame = (dp.frame - startFrame)
          attrs[0].push({ frame: frame, value: dp.position })
          attrs[1].push({ frame: frame, value: dp.rotation.alpha })
          attrs[2].push({ frame: frame, value: dp.rotation.beta })
          attrs[3].push({ frame: frame, value: dp.rotation.radius })
          pathDump.push( "{ frame: " + frame + ", alpha: " + dp.rotation.alpha +
                         ", beta: " + dp.rotation.beta + ", radius: " +
                         dp.rotation.radius + ", position: " + dp.position +"}")
          lastFrame = frame;
        }

        for ( var idx = 0; idx < 4; idx++ ) { anims[idx].setKeys( attrs[idx] ) }

        console.log( pathDump.join("\n") )
        scene.beginDirectAnimation(camera, anims, 0, lastFrame, false);
      } catch(e) {
        console.log(e)
      }
    })
    advancedTexture.addControl(button);


    var button = BABYLON.GUI.Button.CreateSimpleButton("but", "keyF");
    button.width = "100px";
    button.height = "30px";
    button.color = "white";
    button.left = "45%";
    button.top = "10%";
    button.background = "#22222255";
    button.cornerRadius = 20;
    button.onPointerClickObservable.add(function(b){
      var camera = scene.activeCamera;

      cameraPath.push({
        frame: frameCounter,
        rotation: {
          alpha: camera.alpha,
          beta: camera.beta,
          radius: camera.radius
        },
        position: camera.position.clone()
      })
    })
    advancedTexture.addControl(button);


    var button = BABYLON.GUI.Button.CreateSimpleButton("but", "clear");
    button.width = "100px";
    button.height = "30px";
    button.color = "white";
    button.left = "45%";
    button.top = "20%";
    button.background = "#22222255";
    button.cornerRadius = 20;
    button.fontSize = "10px"
    button.onPointerClickObservable.add(function(b){
      cameraPath.length = 0;
      scene.stopAllAnimations()
    })
    advancedTexture.addControl(button);

    var button = BABYLON.GUI.Button.CreateSimpleButton("but", "info");
    button.width = "100px";
    button.height = "30px";
    button.color = "white";
    button.left = "45%";
    button.top = "30%";
    button.background = "#22222255";
    button.cornerRadius = 20;
    button.fontSize = "10px"
    button.onPointerClickObservable.add(function(b){
      console.log( scene.activeCamera.viewport )
    })
    advancedTexture.addControl(button);



    // Finally load the model.
    loadModel(currModel.mlid, currModel.rotate, scene, skyboxMesh, multimat,
              baseMaterialSizes)

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
