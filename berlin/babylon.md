---
title: 3D Tour
permalink: /berlin/babylon
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
<script src="/f/bowser.js"></script>
<script src="/f/babylonhelpers.js"></script>
<script src="/f/models.js"></script>
<script src="/f/modelcache.js"></script>
<script src="/f/buttonhelpers.js"></script>
<script src="/f/soundshelper.js"></script>
<script src="/f/tdhelpers.js"></script>

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

  window.browser = bowser.getParser(window.navigator.userAgent);

  var canvas = document.getElementById("3dcanvas");
  var alltextures = []
  var engine = null;
  var scene = null;
  var multimat = null
  var sceneToRender = null;
  var skyboxMesh = null;
  var currModel = TDHelpers.checkForShareData(window.location)
  var baseMaterialSizes = [64, 256, 512, 1024]
  var textBlock = null;
  var cameraPath = []

  var createDefaultEngine = function() {
    return new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: TDHelpers.disableWebGL2()});
  };

  var delayCreateScene = function () {
    var scene = new BABYLON.Scene(engine);
    document.getElementById("loadingScreen").style.display = "none";
    BABYLON.SceneLoader.ShowLoadingScreen = false;

    var r = createSkyBox(scene)
    skyboxMesh = r[0]
    multimat = r[1]

    loadSkyBoxMaterial(currModel.mlid,baseMaterialSizes[0],alltextures,
                       multimat,scene)

    addKeyboardObserver(scene, skyboxMesh);

    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    textBlock = ButtonHelpers.createTextBlock()
    advancedTexture.addControl(textBlock);

    var button = ButtonHelpers.create("butPrev", "<<<", "-45%", "45%");
    button.onPointerClickObservable.add(ButtonHelpers.CB.previous)
    advancedTexture.addControl(button);

    var button = ButtonHelpers.create("butNext", ">>>", "45%", "45%")
    button.onPointerClickObservable.add(ButtonHelpers.CB.next)
    advancedTexture.addControl(button);

    var button = ButtonHelpers.create("butInfo", "&#128712;", "0%", "45%");
    button.onPointerClickObservable.add(ButtonHelpers.CB.info)
    advancedTexture.addControl(button);

    var button = ButtonHelpers.create("butFS", "fulls", "45%", "-30%")
    button.onPointerClickObservable.add(ButtonHelpers.CB.fullscreen)
    advancedTexture.addControl(button);

    var button = ButtonHelpers.create("butVol", "fulls", "45%", "-40%")
    button.onPointerClickObservable.add(ButtonHelpers.CB.volume)
    advancedTexture.addControl(button);

    var button = ButtonHelpers.create("butMute", "fulls", "45%", "-40%")
    button.onPointerClickObservable.add(ButtonHelpers.CB.mute)
    button.isEnabled = false
    button.notRenderable = true
    advancedTexture.addControl(button);

    var button = ButtonHelpers.create("butShare", "share", "45%", "-20%")
    button.onPointerClickObservable.add(ButtonHelpers.CB.share)
    advancedTexture.addControl(button);

    var button = ButtonHelpers.create("butPlay", "fly>", "45%", "-10%")
    button.onPointerClickObservable.add(ButtonHelpers.CB.flythrough)
    advancedTexture.addControl(button);

    var button = ButtonHelpers.create("butFTPlay", "playKFs", "45%", "0%")
    button.onPointerClickObservable.add(ButtonHelpers.CB.playKeyframes)
    advancedTexture.addControl(button);


    var button = ButtonHelpers.create("butAddKeyFrame", "addKF", "45%", "10%")
    button.onPointerClickObservable.add(ButtonHelpers.CB.addKeyframe)
    advancedTexture.addControl(button);


    var button = ButtonHelpers.create("butClear", "clearKF", "45%", "20%")
    button.onPointerClickObservable.add(ButtonHelpers.CB.clearKeyframes)
    advancedTexture.addControl(button);

    var button = ButtonHelpers.create("butKFInfo", "info", "45%", "30%")
    button.onPointerClickObservable.add(ButtonHelpers.CB.showCameraDetails)
    advancedTexture.addControl(button);

    // Finally load the model.
    loadModel(currModel, scene, skyboxMesh, multimat, baseMaterialSizes)

    SoundsHelper.load(scene)
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
