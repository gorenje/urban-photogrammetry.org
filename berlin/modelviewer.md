---
title: 3D Tour
permalink: /berlin/modelviewer
layout: modelviewer
---

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
<script src="/f/bowser.js"></script>

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

  BABYLON.SceneLoader.ShowLoadingScreen = true;
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
  var textBlock = {
    text:"",
    isVisible: false
  }
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

    TDHelpers.resize();
    engine.resize()
    var r = createSkyBox(scene)
    skyboxMesh = r[0]
    multimat = r[1]

    loadSkyBoxMaterial(currModel.mlid,baseMaterialSizes[0],alltextures,
                       multimat,scene)

    addKeyboardObserver(scene, skyboxMesh);


    if ( TDHelpers.isLocalhost() && false ) {
      var wa = document.createElement('script');
      wa.type = 'text/javascript';
      wa.async = true;
		  wa.src = '/f/bjs/babylon.inspector.bundle.js';
		  var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(wa, s);

      ButtonHelpers.addButton("butInsp", "inspbutton", ButtonHelpers.CB.inspect)

      ButtonHelpers.addButton("butInfo", "infobutton", ButtonHelpers.CB.info)

      ButtonHelpers.addButton("butFTPlay", "playkfsbutton",
                              ButtonHelpers.CB.playKeyframes)

      ButtonHelpers.addButton("butAddKeyFrame", "addkfsbutton",
                              ButtonHelpers.CB.addKeyframe)

      ButtonHelpers.addButton("butClear", "clearkfsbutton",
                              ButtonHelpers.CB.clearKeyframes)

      ButtonHelpers.addButton("butKFInfo", "showkfsbutton",
                              ButtonHelpers.CB.showCameraDetails)
    }

    ButtonHelpers.addButton("butPrev", "prevbutton", ButtonHelpers.CB.previous)
    ButtonHelpers.addButton("butNext", "nextbutton", ButtonHelpers.CB.next)

    ButtonHelpers.addButton("butFS", "fullscreenbutton",
                            ButtonHelpers.CB.fullscreen)

    var b = ButtonHelpers.addButton("butFSexit", "fullscreenbutton",
                                    ButtonHelpers.CB.fullscreen_exit)
    $(b).hide()


    var b = ButtonHelpers.addButton("butVol", "mvmutebutton",
                                    ButtonHelpers.CB.volume)
    $(b).hide()
    ButtonHelpers.addButton("butMute", "mvmutebutton", ButtonHelpers.CB.mute)

    ButtonHelpers.addButton("butShare", "mvsharebutton", ButtonHelpers.CB.share)

    var b = ButtonHelpers.addButton("butCopied", "mvsharebutton",
                                    ButtonHelpers.CB.share)
    $(b).hide()
    var b = ButtonHelpers.addButton("butLoader", "mvsharebutton")
    $(b).hide()

    ButtonHelpers.addButton("butPlay", "mvplaybutton", ButtonHelpers.CB.flythrough)

    var b = ButtonHelpers.addButton("butPause", "mvplaybutton",
                                    ButtonHelpers.CB.stopflythrough)
    $(b).hide()

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
    TDHelpers.resize();
    engine.resize()
  });
</script>
