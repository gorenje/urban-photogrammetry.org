var ButtonHelpers = {

  create: function(name, text, left, top) {
    var button = BABYLON.GUI.Button.CreateSimpleButton(name, text);

    button.width        = "100px";
    button.height       = "30px";
    button.color        = "white";
    button.left         = left;
    button.top          = top;
    button.background   = "#22222255";
    button.cornerRadius = 20;

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

  // Callbacks for the button clicks.
  CB: {
    previous: function(evt) {
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
        o: currModel.mlid
      }

      var url = new URL(window.location)
      console.log( url.origin + url.pathname + "#" + window.btoa(
        JSON.stringify(data)))
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
        startTimeStamp = Date.now();
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

    flythrough: function(evt) {
      var frameRate = 40;
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

      var anim = scene.beginDirectAnimation(camera,
                                            anims,
                                            0,
                                            lastFrame + frameRate,
                                            false);

      scene.onPointerDown = function(e) {
        anim.stop()
        scene.onPointerDown = null;
      }
      anim.onAnimationEndObservable.addOnce(function() {
        scene.onPointerDown = null
      })
    },

    playKeyframes: function(evt) {
      try {
        var camera = scene.activeCamera;
        var frameRate = 30;
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
        scene.beginDirectAnimation(camera, anims, 0, lastFrame, false);
      } catch(e) {
        console.log(e)
      }
    },

    addKeyframe: function(evt) {
      var camera = scene.activeCamera;

      cameraPath.push({
        frame: frameCounter,
        rotation: {
          alpha: camera.alpha,
          beta: camera.beta,
          radius: camera.radius
        },
        position: camera.position.clone(),
        target: camera.target.clone()
      })
    },

    clearKeyframes: function(evt) {
      cameraPath.length = 0;
      scene.stopAllAnimations()
    },

    showCameraDetails: function(evt) {
      var camera = scene.activeCamera;
      console.log( "{ alpha: " + camera.alpha +
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
                   "}},")
    },
  }
}
