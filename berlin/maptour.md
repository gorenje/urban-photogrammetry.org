---
title: 3D Tour
permalink: /berlin/maptour
layout: map
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

var canvas = null;
var alltextures = []
var engine = null;
var scene = null;
var multimat = null
var sceneToRender = null;
var skyboxMesh = null;
var currModel = null;
var baseMaterialSizes = [64, 256, 512, 1024]
var textBlock = null;
var cameraPath = []

var map = null;

function displayModel(mlid) {
  window.browser = bowser.getParser(window.navigator.userAgent);

  canvas = document.getElementById("3dcanvas");
  currModel = UPModels.modelForMlid(mlid);

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

    if ( TDHelpers.isMobile() ) {
      var button = ButtonHelpers.create("butPrev", "<<<", "-40%", "45%");
      button.onPointerClickObservable.add(ButtonHelpers.CB.previous)
      advancedTexture.addControl(button);

      var button = ButtonHelpers.create("butNext", ">>>", "40%", "45%")
      button.onPointerClickObservable.add(ButtonHelpers.CB.next)
      advancedTexture.addControl(button);

      var button = ButtonHelpers.create("butVol", "vol", "0%", "-45%")
      button.onPointerClickObservable.add(ButtonHelpers.CB.volume)
      advancedTexture.addControl(button);

      var button = ButtonHelpers.create("butMute", "mute", "0%", "-45%")
      button.onPointerClickObservable.add(ButtonHelpers.CB.mute)
      ButtonHelpers.hide(button)
      advancedTexture.addControl(button);

      var button = ButtonHelpers.create("butPlay", "play", "0%", "45%")
      button.onPointerClickObservable.add(ButtonHelpers.CB.flythrough)
      advancedTexture.addControl(button);

      var button = ButtonHelpers.create("butExit", "fulls", "-40%", "-45%")
      button.onPointerClickObservable.add(ButtonHelpers.CB.exit)
      advancedTexture.addControl(button);

      if ( ButtonHelpers.showShare() ) {
        var button = ButtonHelpers.create("butShare", "share", "-40%", "-40%")
        button.onPointerClickObservable.add(ButtonHelpers.CB.share)
        advancedTexture.addControl(button);
      }

      if ( !ButtonHelpers.isSafari() ) {
        var button = ButtonHelpers.create("butFS", "fulls", "40%", "-45%")
        button.onPointerClickObservable.add(ButtonHelpers.CB.fullscreen)
        advancedTexture.addControl(button);

        var button = ButtonHelpers.create("butFSexit", "fulls", "45%", "-45%")
        button.onPointerClickObservable.add(ButtonHelpers.CB.fullscreen_exit)
        ButtonHelpers.hide(button)
        advancedTexture.addControl(button);
      }

    } else {
      // --- this is the desktop interface
      var button = ButtonHelpers.create("butPrev", "<<<", "-45%", "45%");
      button.onPointerClickObservable.add(ButtonHelpers.CB.previous)
      advancedTexture.addControl(button);

      var button = ButtonHelpers.create("butNext", ">>>", "45%", "45%")
      button.onPointerClickObservable.add(ButtonHelpers.CB.next)
      advancedTexture.addControl(button);

      var button = ButtonHelpers.create("butVol", "vol", "0%", "-45%")
      button.onPointerClickObservable.add(ButtonHelpers.CB.volume)
      advancedTexture.addControl(button);

      var button = ButtonHelpers.create("butMute", "mute", "0%", "-45%")
      button.onPointerClickObservable.add(ButtonHelpers.CB.mute)
      ButtonHelpers.hide(button)
      advancedTexture.addControl(button);

      var button = ButtonHelpers.create("butPlay", "play", "0%", "45%")
      button.onPointerClickObservable.add(ButtonHelpers.CB.flythrough)
      advancedTexture.addControl(button);

      var button = ButtonHelpers.create("butExit", "fulls", "-45%", "-45%")
      button.onPointerClickObservable.add(ButtonHelpers.CB.exit)
      advancedTexture.addControl(button);

      if ( ButtonHelpers.showShare() ) {
        var button = ButtonHelpers.create("butShare", "share", "-45%", "-42%")
        button.onPointerClickObservable.add(ButtonHelpers.CB.share)
        advancedTexture.addControl(button);
      }

      if ( !ButtonHelpers.isSafari() ) {
        var button = ButtonHelpers.create("butFS", "fulls", "45%", "-45%")
        button.onPointerClickObservable.add(ButtonHelpers.CB.fullscreen)
        advancedTexture.addControl(button);

        var button = ButtonHelpers.create("butFSexit", "fulls", "45%", "-45%")
        button.onPointerClickObservable.add(ButtonHelpers.CB.fullscreen_exit)
        ButtonHelpers.hide(button)
        advancedTexture.addControl(button);
      }
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
    if ( engine ) engine.resize();
  });
}


function createStreetMap() {
  var browser = bowser.getParser(window.navigator.userAgent);

  $('#loadingScreen').hide()
  $('#3dcanvas').hide()

  map = new OSMBuildings({
    container: 'map',
    position: { latitude: 52.52636, longitude: 13.42896 },
    zoom: 19,
    minZoom: 1,
    maxZoom: 30,
    tilt: 30,
    attribution: '© Data <a href="https://openstreetmap.org/copyright/">OpenStreetMap</a> © Map <a href="https://mapbox.com/">Mapbox</a> © 3D <a href="https://osmbuildings.org/copyright/">OSM Buildings</a>'
  })

  // map.addMapTiles('https://{s}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v8/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidXJiYW4tcGhvdG9ncmFtbWV0cnkiLCJhIjoiY2tzd3lrM3M4MDdqajJ1cDJobXlqY2Z1YiJ9.xgtMCLrDbaQn8Kyb1zqAwA&style=cksx0f5e04xkn18o7zt5sincf');
  map.addMapTiles('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

  if ( browser.getPlatformType() !== "mobile" ) {
    map.addGeoJSONTiles('https://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json');
  }

  var haveObjs = [
    {
      mlid: "70fcd5892cb346429c04c1d852b96169",
      loc: [52.53858,13.42697],
      rotation: 30,
      scale: 50
    },
    {
      mlid: "924b850d72bd46478ab650cfa353d94d-1",
      loc: [52.52830,13.39892],
      rotation: 0,
      scale: 20
    },
    {
      mlid: "924b850d72bd46478ab650cfa353d94d-2",
      loc: [52.52802,13.39907],
      rotation: 60,
      scale: 30
    },
    {
      mlid: "924b850d72bd46478ab650cfa353d94d-3",
      loc: [52.52819,13.39915],
      rotation: 120,
      scale: 30
    },
    {
      mlid: "0ec35096975442188f5278665013bfae",
      loc: [52.56928,13.44615],
      rotation: -95,
      scale: 30
    },
    {
      mlid: "3d0f151bf808494a9eb1b2a81665e832",
      loc: [52.52571,13.42987],
      rotation: 60,
      scale: 30
    },
    {
      mlid: "3867f03ae07b43d29630e70b86f7abc9",
      loc: [52.52636,13.42896],
      rotation: 210,
      scale: 30
    },
  ]

  $.each( haveObjs, function(idx, obj) {
    map.addOBJ( `${location.protocol}//${location.hostname}:${location.port}/m/${obj.mlid}/lods.obj`,
                { latitude: obj.loc[0], longitude: obj.loc[1] },
                { scale: obj.scale,
                  altitude: 15,
                  color: 'purple',
                  id: 'up-' + obj.mlid,
                  rotation: obj.rotation
                });
  })

  map.on('pointerup', e => {
    $.each( e.features || [], function(idx,obj) {
      if ( obj.id.substring(0,3) === "up-" ) {
        $('#3dcanvas').fadeIn(500, function() {
          if ( engine == null ) {
            displayModel(obj.id.substring(3))
          } else {
            clearScene(scene, skyboxMesh, alltextures)

            // restruction
            currModel      = UPModels.modelForMlid(obj.id.substring(3))
            var r          = createSkyBox(scene)
            skyboxMesh     = r[0]
            multimat       = r[1]
            textBlock.text = currModel.text;

            loadSkyBoxMaterial(currModel.mlid, baseMaterialSizes[0],
                               alltextures, multimat,scene)
            addKeyboardObserver(scene, skyboxMesh);
            loadModel(currModel, scene, skyboxMesh, multimat, baseMaterialSizes)
          }
        })
        $('#map').fadeOut(500)
      }
    })
  });
}

$(window).on('infoscreen:close', createStreetMap )
</script>
