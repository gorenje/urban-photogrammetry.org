var currFlythrough = null;

var ButtonHelpers = {

  AllButtons: {
  },

  ImageMap: {
    butFS:     ButtonImages.butFS,
    butFSexit: ButtonImages.butFSexit,
    butShare:  ButtonImages.butShare,
    butCopied: ButtonImages.butCopied,
    butPlay:   ButtonImages.butPlay,
    butPause:  ButtonImages.butPause,
    butPrev:   ButtonImages.butPrev,
    butNext:   ButtonImages.butNext,
    butVol:    ButtonImages.butVol,
    butMute:   ButtonImages.butMute,
    butExit:   ButtonImages.butExit,
  },

  imageButton: function(filename) {
    button = BABYLON.GUI.Button.CreateImageOnlyButton(name, filename);
    button.width = "0.07vw";
    button.fixedRatio = 1
    button.color = "#ffffff33";
    button.cornerRadius = 10;
    button.background = "#00000033";

    return button
  },

  hide: function(button) {
    button.isEnabled = false
    button.notRenderable = true
  },

  show: function(button) {
    button.isEnabled = true
    button.notRenderable = false
  },

  toggle: function(showButName, hideButName) {
    ButtonHelpers.show(ButtonHelpers.AllButtons[showButName])
    ButtonHelpers.hide(ButtonHelpers.AllButtons[hideButName])
  },

  create: function(name, text, left, top) {
    var button = BABYLON.GUI.Button.CreateSimpleButton(name, text);

    button.height       = "30px";
    button.width        = "100px";
    button.color        = "white";
    button.background   = "#22222255";
    button.cornerRadius = 20;

    var imageName = ButtonHelpers.ImageMap[name]
    if ( imageName ) {
      button = ButtonHelpers.imageButton(imageName);
    }

    button.left = left;
    button.top  = top;

    ButtonHelpers.AllButtons[name] = button
    return button;
  },

  createTextBlock: function() {
    var textBlock = new BABYLON.GUI.TextBlock()

    textBlock.text         = currModel.text;
    textBlock.isVisible    = false;
    textBlock.width        = "300px";
    textBlock.height       = "300px";
    textBlock.color        = "white";
    textBlock.left         = "45%";
    textBlock.top          = "-40%";
    textBlock.background   = "red";
    textBlock.cornerRadius = 20;
    textBlock.fontSize     = "10px"

    return textBlock;
  },

  showShare: function() {
    return true;
    /* return browser.satisfies( { mobile: {
     *   safari: ">=12.1",
     *   chrome: ">=92",
     *   firefox: ">=90"
     * }}
     * )*/
  },

  isSafari: function() {
    return browser.satisfies( { safari: ">0" } )
  },

  // Callbacks for the button clicks.
  CB: {
    exit: function(evt) {
      $('#3dcanvas').fadeOut(500);

      scene.stopAllAnimations()
      setTimeout(function() {
        modelMesh.dispose(true,true)
        skyboxMesh.dispose(true,true)
        for ( var idx = 0; idx < scene.meshes.length; idx++ ) {
          scene.meshes[idx].dispose()
        }
        scene.meshes.length = 0
      }, 20)

      SoundsHelper.stopAll()
      ButtonHelpers.toggle("butPlay", "butPause")
      setTimeout( MapHelper.modelExaminerDone, 750 );
      ButtonHelpers.AllButtons["butExit"].background = "#00000033";
      $('#map').fadeIn(200);
    },

    mute: function(evt) {
      muteOn = false;
      BABYLON.Engine.audioEngine.setGlobalVolume(1)
      SoundsHelper.playModel(currModel.mlid)
      ButtonHelpers.toggle("butVol", "butMute")
    },

    volume: function(evt) {
      muteOn = true;
      BABYLON.Engine.audioEngine.setGlobalVolume(0)
      SoundsHelper.stopAll()
      ButtonHelpers.toggle("butMute", "butVol")
    },

    fullscreen: function(evt) {
      if ( !engine.isFullscreen ) {
        engine.enterFullscreen(false)
      }
      ButtonHelpers.toggle("butFSexit", "butFS")
    },

    fullscreen_exit: function(evt) {
      if ( engine.isFullscreen ) {
        engine.exitFullscreen(false)
      }
      ButtonHelpers.toggle("butFS", "butFSexit")
    },

    share: function(evt) {
      var camera = scene.activeCamera;

      var data = {
        px: camera.position.x,
        py: camera.position.y,
        pz: camera.position.z,
        tx: camera.target.x,
        ty: camera.target.y,
        tz: camera.target.z,
        a: camera.alpha,
        b: camera.beta,
        r: camera.radius,
        o: currModel.mlid,
        t: 'e'
      }

      var url = new URL(window.location)
      var shareUrl = url.origin + url.pathname + "#" + window.btoa(
        JSON.stringify(data));

      try {
        TDHelpers.copyToClipboard( shareUrl )
        ButtonHelpers.toggle("butCopied", "butShare")
        setTimeout( function() {
          ButtonHelpers.toggle("butShare", "butCopied")
        }, 2500)
      } catch ( e ) {
        console.log(e)
      }

      try {
        navigator.share({ title: "Link to Model", url: shareUrl })
      } catch ( e ) {
        console.log(e)
      }
      console.log( shareUrl)
    },

    previous: function(evt) {
      prepareFadeOut(function() {
        // destruction
        clearScene(scene, skyboxMesh, alltextures)

        // restruction
        currModel      = UPModels.previous(currModel)
        var r          = createSkyBox(scene)
        skyboxMesh     = r[0]
        multimat       = r[1]
        textBlock.text = currModel.text;

        loadSkyBoxMaterial(currModel.mlid, baseMaterialSizes[0],
                           alltextures, multimat,scene)
        addKeyboardObserver(scene, skyboxMesh);
        loadModel(currModel, scene, skyboxMesh, multimat, baseMaterialSizes)
      })
    },

    next: function(evt) {
      prepareFadeOut(function() {
	      // destruction
        clearScene(scene, skyboxMesh, alltextures)

        // restruction
        currModel      = UPModels.next(currModel)
        var r          = createSkyBox(scene)
        skyboxMesh     = r[0]
        multimat       = r[1]
        textBlock.text = currModel.text;

        loadSkyBoxMaterial(currModel.mlid, baseMaterialSizes[0],
                           alltextures, multimat, scene)
        addKeyboardObserver(scene, skyboxMesh);
        loadModel(currModel, scene, skyboxMesh, multimat, baseMaterialSizes)
      })
    },

    info: function(evt) {
      textBlock.isVisible = !textBlock.isVisible;
    },

    stopflythrough: function(evt) {
      try { currFlythrough.stop() } catch (e) {}
      currFlythrough = null
    },

    flythrough: function(evt) {
      if ( currFlythrough !== null ) return;

      ButtonHelpers.toggle("butPause", "butPlay")
      var frameRate = Math.ceil(
        TDHelpers.average(
          currModel.flythrough.map( a => a.avgfps )
        )
      )
      var anims = TDHelpers.prepareAnimations(frameRate)
      var startFrame = currModel.flythrough[0].frame;
      var lastFrame = 0;
      var attrs = [ [], [], [], [], [] ];

      var camera = scene.activeCamera;

      attrs[0].push({ frame: 0, value: camera.position.clone() })
      attrs[1].push({ frame: 0, value: camera.alpha })
      attrs[2].push({ frame: 0, value: camera.beta })
      attrs[3].push({ frame: 0, value: camera.radius })
      attrs[4].push({ frame: 0, value: camera.target.clone() })

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
      currFlythrough = scene.beginDirectAnimation(camera,
                                                  anims,
                                                  0,
                                                  lastFrame + frameRate,
                                                  false);

      scene.onPointerDown = function(e) {
        try { currFlythrough.stop() } catch (e) {}
        currFlythrough = null
        scene.onPointerDown = null;
      }
      currFlythrough.onAnimationEndObservable.addOnce(function() {
        scene.onPointerDown = null
        currFlythrough = null
        new BABYLON.SubMesh(3, 0, skyboxMesh.getTotalVertices(),
                            0, skyboxMesh.getTotalIndices(),
                            skyboxMesh);
        ButtonHelpers.toggle("butPlay", "butPause")

        if ( evt && evt.autoExitAfterFlythrough ) {
          TDHelpers.setupAutoExit()
        }
      })
    },

    playKeyframes: function(evt) {
      try {
        var camera = scene.activeCamera;
        var frameRate = Math.ceil(
          TDHelpers.average(
            cameraPath.map( a => a.avgfps )
          )
        )
        var pathDump = [];

        var anims = TDHelpers.prepareAnimations(frameRate)
        var attrs = [ [], [], [], [], [] ];

        var startFrame = cameraPath[0].frame;
        var lastFrame = 0;

        for ( var idx = 0; idx < cameraPath.length; idx++ ) {
          var dp = cameraPath[idx]
          var frame = (dp.frame - startFrame)
          attrs[0].push({ frame: frame, value: dp.position })
          attrs[1].push({ frame: frame, value: dp.rotation.alpha })
          attrs[2].push({ frame: frame, value: dp.rotation.beta })
          attrs[3].push({ frame: frame, value: dp.rotation.radius })
          attrs[4].push({ frame: frame, value: dp.target })

          pathDump.push( "{ frame: " + frame +
                         ", avgfps: " + dp.avgfps +
                         ", alpha: " + dp.rotation.alpha +
                         ", beta: " + dp.rotation.beta +
                         ", radius: " + dp.rotation.radius +
                         ", position: { x:" + dp.position.x +
                                     ", y: " + dp.position.y +
                                     ", z: " + dp.position.z +
                         "}, target: { x:" + dp.target.x +
                                   ", y: " + dp.target.y +
                                   ", z: " + dp.target.z +
                         "}},")
          lastFrame = frame;
        }

        $.each(anims, function( index, anim ) { anim.setKeys( attrs[index] ) })

        console.log( pathDump.join("\n") )
        TDHelpers.copyToClipboard( pathDump.join("\n") )
        scene.beginDirectAnimation(camera, anims, 0, lastFrame, false);
      } catch(e) {
        console.log(e)
      }
    },

    addKeyframe: function(evt) {
      var camera = scene.activeCamera;

      cameraPath.push({
        frame: frameCounter,
        avgfps: Math.ceil(TDHelpers.average(lastTenFps)),
        rotation: {
          alpha:  camera.alpha,
          beta:   camera.beta,
          radius: camera.radius
        },
        position: camera.position.clone(),
        target:   camera.target.clone()
      })
    },

    clearKeyframes: function(evt) {
      cameraPath.length = 0;
      scene.stopAllAnimations()
    },

    showCameraDetails: function(evt) {
      var camera = scene.activeCamera;
      var jsonStr = "{ alpha: " + camera.alpha +
                    ", beta: " + camera.beta +
                    ", radius: " + camera.radius +
                    ", position: {" +
                    "  x: " + camera.position.x +
                    ", y: " + camera.position.y +
                    ", z: " + camera.position.z +
                    "}, target: { "+
                    "  x: " + camera.target.x +
                    ", y: " + camera.target.y +
                    ", z: " + camera.target.z +
                    "}},";
      console.log( jsonStr )
      TDHelpers.copyToClipboard( jsonStr )
    },
  }
}
