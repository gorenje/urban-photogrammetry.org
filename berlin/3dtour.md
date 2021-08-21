---
title: 3D Tour
permalink: /berlin/3dtour
layout: 3dtour
---


<script src="/f/bjs/jquery.js"></script>
<script src="/f/bjs/jquery.qrcode.min.js"></script>
<script src="/f/bjs/ammo.js"></script>
<script src="/f/bjs/recast.js"></script>
<script src="/f/bjs/cannon.js"></script>
<script src="/f/bjs/Oimo.js"></script>
<script src="/f/bjs/earcut.min.js"></script>
<script src="/f/bjs/babylon.js"></script>
<script src="/f/bjs/babylonjs.materials.min.js"></script>
<script src="/f/bjs/babylonjs.proceduralTextures.min.js"></script>
<script src="/f/bjs/babylonjs.postProcess.min.js"></script>
<script src="/f/bjs/babylonjs.loaders.min.js"></script>
<script src="/f/bjs/babylonjs.serializers.min.js"></script>
<script src="/f/bjs/babylon.gui.min.js"></script>
<script src="/f/bjs/babylon.inspector.bundle.js"></script>
<script src="/f/bjs/babylon.nodeEditor.js"></script>
<script src="/f/bjs/babylon.guiEditor.js"></script>
<script src="/f/babylonhelpers.js"></script>
<script src="/f/models.js"></script>
<script src="/f/modelcache.js"></script>

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
    document.getElementById("loadingScreen").innerHTML = "loading... " + this.loadingUIText;
    if ( typeof(this._onceonly) == "undefined" ) {
      window.addEventListener("resize", this._resizeLoadingUI);
      this._onceonly = "defined"
    }
  };

  BABYLON.DefaultLoadingScreen.prototype.hideLoadingUI = function(){
    document.getElementById("loadingScreen").style.display = "none";
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
    document.getElementById("loadingScreen").style.display = "none";
    BABYLON.SceneLoader.ShowLoadingScreen = false;

    var r = createSkyBox(scene)
    skyboxMesh = r[0]
    multimat = r[1]

    loadSkyBoxMaterial(currModel.mlid,baseMaterialSizes[0],alltextures,multimat,scene)

    addKeyboardObserver(scene, skyboxMesh);

    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

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

    var button = createButton("butPrev", "<<<", "-45%", "45%");
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
        loadModel(currModel, scene, skyboxMesh, multimat, baseMaterialSizes)
      })
    })
    advancedTexture.addControl(button);

    var button = createButton("butNext", ">>>", "45%", "45%")
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
                           alltextures, multimat, scene)
        addKeyboardObserver(scene, skyboxMesh);
        loadModel(currModel, scene, skyboxMesh, multimat, baseMaterialSizes)
      })
    })
    advancedTexture.addControl(button);


    var button = createButton("butPlay", "tour", "0%", "45%")
    button.onPointerClickObservable.add(function(b){
      var frameRate = 80;
      var anims = prepareAnimations(frameRate)
      var startFrame = currModel.flythrough[0].frame;
      var lastFrame = 0;
      var attrs = [ [], [], [], [], [] ];

      attrs[0].push({ frame: 0, value: vector3FromHash(currModel.camera) })
      attrs[1].push({ frame: 0, value: currModel.camera.alpha })
      attrs[2].push({ frame: 0, value: currModel.camera.beta })
      attrs[3].push({ frame: 0, value: currModel.camera.radius })
      attrs[4].push({ frame: 0, value: vector3FromHash(currModel.camera.target) })

      $.each( currModel.flythrough, function(idx,keyframe) {
        var frame = keyframe.frame - startFrame + frameRate;

        attrs[0].push({ frame: frame, value: vector3FromHash(keyframe.position)})
        attrs[1].push({ frame: frame, value: keyframe.alpha })
        attrs[2].push({ frame: frame, value: keyframe.beta })
        attrs[3].push({ frame: frame, value: keyframe.radius })
        attrs[4].push({ frame: frame, value: vector3FromHash(keyframe.target)})
        lastFrame = frame;
      })

      $.each(anims, function( index, anim ) { anim.setKeys( attrs[index] ) })

      var anim = scene.beginDirectAnimation(scene.activeCamera, anims, 0,
                                            lastFrame + frameRate, false);

      scene.onPointerDown = function(e) {
        anim.stop()
        scene.onPointerDown = null;
      }
      anim.onAnimationEndObservable.add(function() {
        scene.onPointerDown = null
      })
    })
    advancedTexture.addControl(button);

    // Finally load the model.
    loadModel(currModel, scene, skyboxMesh, multimat, baseMaterialSizes)

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
