---
title: Berlin 3D Tour
permalink: /berlin/maptour
layout: maptour
---

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

var canvas = null;
var alltextures = []
var engine = null;
var scene = null;
var multimat = null
var sceneToRender = null;
var skyboxMesh = null;
var currModel = null;
var baseMaterialSizes = [64, 256, 512, 1024]
var cameraPath = []
var autoExitTimeout = null;
var map = null;

$(function(){
  window.browser = bowser.getParser(window.navigator.userAgent);

  $(document).bind("scroll keypress touchstart click keydown keyup mousemove mousedown mouseup", function(){
    clearTimeout(autoExitTimeout)
    $(ButtonHelpers.AllButtons["butExit"]).css('background-color',"#00000033");
  });
  $(window).bind("scroll keypress touchstart click keydown keyup mousemove mousedown mouseup", function(){
    clearTimeout(autoExitTimeout)
    $(ButtonHelpers.AllButtons["butExit"]).css('background-color',"#00000033");
  });
});

function displayModel(mlid, model_from_shared = undefined) {
  canvas = document.getElementById("3dcanvas");
  currModel = model_from_shared || UPModels.modelForMlid(mlid);

  var createDefaultEngine = function() {
    return new BABYLON.Engine(canvas, true, {
      alpha: false,
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: TDHelpers.disableWebGL2(),
    }, false);
  };

  var delayCreateScene = function () {
    var scene = new BABYLON.Scene(engine);
    document.getElementById("loadingScreen").style.display = "none";
    BABYLON.SceneLoader.ShowLoadingScreen = false;

    TDHelpers.resize();
    engine.resize()

    var r = createSkyBox(scene)
    skyboxMesh = r[0]
    multimat = r[1]

    if ( TDHelpers.isLocalhost() ) {
      var wa = document.createElement('script');
      wa.type = 'text/javascript';
	    wa.src = '/f/bjs/babylon.inspector.bundle.js';
	    var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(wa, s);
    }

    loadSkyBoxMaterial(currModel.mlid,baseMaterialSizes[0],alltextures,
                       multimat,scene)

    addKeyboardObserver(scene, skyboxMesh);

    ButtonHelpers.addButton("butPlay", "mvplaybutton",
                            ButtonHelpers.CB.flythrough)

    var button = ButtonHelpers.addButton("butPause", "mvplaybutton",
                                         ButtonHelpers.CB.stopflythrough)
    $(button).hide()

    ButtonHelpers.addButton("butExit", "mvexitbutton", ButtonHelpers.CB.exit)
    ButtonHelpers.addButton("butShare", "mvsharebutton", ButtonHelpers.CB.share)

    var button = ButtonHelpers.addButton("butCopied", "mvsharebutton")
    $(button).hide()
    var button = ButtonHelpers.addButton("butLoader", "mvsharebutton")
    $(button).hide()

    ButtonHelpers.addButton("butInfo", "mvinfobutton", ButtonHelpers.CB.info)

    if ( !ButtonHelpers.isSafari() ) {
      ButtonHelpers.addButton("butFS", "fullscreenbutton",
                              ButtonHelpers.CB.fullscreen);
      var button = ButtonHelpers.addButton("butFSexit", "fullscreenbutton",
                                           ButtonHelpers.CB.fullscreen_exit);
      $(button).hide()
    }

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
    if ( engine ) {
      TDHelpers.resize();
      engine.resize()
    }
  });
}

$(window).on('infoscreen:close', MapHelper.createStreetMap )
</script>
