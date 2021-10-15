var currFlythrough = null;

var ButtonHelpers = {

  AllButtons: {},
  ImageMap: ButtonImages,

  addButton: function(name, cssClass, callback = undefined, icon_name = undefined) {
    var img = document.createElement('img')

    img.className = `viewerbutton ${cssClass}`
    img.src = ButtonHelpers.ImageMap[icon_name || name] || ButtonHelpers.ImageMap.butUnknown;
    img.onclick = callback || function(){};

    $('#viewerbuttons').append( img )
    ButtonHelpers.AllButtons[name] = img;

    return img;
  },

  hide: function(button) {
    $(button).hide()
  },

  show: function(button) {
    $(button).show()
  },

  toggle: function(showButName, hideButName, thirdButName=undefined) {
    ButtonHelpers.show(ButtonHelpers.AllButtons[showButName])
    ButtonHelpers.hide(ButtonHelpers.AllButtons[hideButName])
    if (thirdButName) {
      ButtonHelpers.hide(ButtonHelpers.AllButtons[thirdButName])
    }
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
      $('#modelviewer').fadeOut(500);

      scene.stopAllAnimations()
      setTimeout(function() {
        clearScene(scene, skyboxMesh, alltextures);
      }, 20)

      SoundsHelper.stopAll()
      ButtonHelpers.toggle("butPlay", "butPause")
      setTimeout( MapHelper.modelExaminerDone, 750 );
      $(ButtonHelpers.AllButtons["butExit"]).css('background-color',"#00000033");
      $('#map').fadeIn(200, function() { $("#mvinfotextbox").remove() });
      clearTimeout(autoExitTimeout)
    },

    info: function(evt) {
      var img = document.createElement('div')

      img.id = "mvinfotextbox"
      img.className = "infotextbox"
      img.style = "display: none;"
      img.onclick = function() {
        $(this).fadeOut(400, function(){
          $(this).remove()
        })
      }.bind(img)

      $('#viewerbuttons').append( img )

      img.innerHTML = "<strong>Urban Photogrammetry</strong><p><span>Three-Dimensionalisation of urban spaces.<p>Presenting a 3D virtual tour of Berlins cultural history.</span><img class='closer' src='"+ButtonHelpers.ImageMap["butExit"]+"'/><p>[<a target=_blank href='http://urban-photogrammetry.org'>Home</a>]&nbsp;[<a target=_blank href='mailto:info@urban-photogrammetry.org'>Contact</a>]";

      $(img).fadeIn(300);
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
      var shareUrl = url.origin + url.pathname + "?l=" + window.btoa(
        JSON.stringify(data)
      );
      console.log( shareUrl)

      ButtonHelpers.toggle("butLoader", "butCopied", "butShare")

      $.ajax({
        url: "https://r.upo.sh/image",
        method: "post",
        async: true,
        data: { },
        dataType: "text",
        crossDomain: true,
        headers: { "X-UPO-Data": window.btoa(JSON.stringify(data)) }
      }).done(function(data,status,resp){
        shareUrl = resp.getResponseHeader("X-UPO-Data");

        try {
          TDHelpers.copyToClipboard( shareUrl )
          ButtonHelpers.toggle("butCopied", "butShare", "butLoader")
          setTimeout( function() {
            ButtonHelpers.toggle("butShare", "butLoader","butCopied")
          }, 2500)
        } catch ( e ) {}

        try {
          navigator.share({
            title: "Urban-Photogrammetry.org",
            text: "Check out the model @ Urban-Photogrammetry.org",
            url: shareUrl
          })
        } catch ( e ) { prompt("URL",shareUrl) }
      }).fail(function(err){
        try {
          TDHelpers.copyToClipboard( shareUrl )
          ButtonHelpers.toggle("butCopied", "butShare", "butLoader")
          setTimeout( function() {
            ButtonHelpers.toggle("butShare", "butLoader","butCopied")
          }, 2500)
        } catch ( e ) {}

        try {
          navigator.share({
            title: "Urban-Photogrammetry.org",
            text: "Check out the model @ Urban-Photogrammetry.org",
            url: shareUrl
          })
        } catch ( e ) { prompt("URL",shareUrl) }
      })
    },

    stopflythrough: function(evt) {
      var ref = currFlythrough;
      currFlythrough = null
      try { ref.stop() } catch (e) {}
      scene.onPointerDown = null;
    },

    flythrough: function(evt) {
      if ( currFlythrough !== null ) return;

      ButtonHelpers.toggle("butPause", "butPlay")
      var frameRate = Math.ceil(
        TDHelpers.average(
          currModel.flythrough.map( a => a.avgfps )
        )
      )

      /*
       * The intention here so to have 3 animations two with easing and the
       * third has no easing. Basically initial animation are the two first
       * keyframes, the middle animation has no easing and contains all the
       * keyframes from 2 to n-1 (n being total number of keyframes). The
       * last anim contains the last 2 keyframes and has an easing. This
       * makes for a smoother animation around the model.
       *
       * Tricky is stopping the right animation and preventing the other
       * animations from running when one animation is stopped.
       */
      var anims = TDHelpers.prepareAnimationsFirstMiddleLast(frameRate)

      var startFrame = currModel.flythrough[0].frame;
      var lastFrame = 0;
      var attrs = {
        first:  [ [], [], [], [], [] ],
        middle: [ [], [], [], [], [] ],
        last:   [ [], [], [], [], [] ],
      }

      var camera = scene.activeCamera;
      var idxSecondToLastFrame = currModel.flythrough.length - 2
      var idxLastFrame = currModel.flythrough.length - 1

      attrs.first[0].push({ frame: 0, value: camera.position.clone() })
      attrs.first[1].push({ frame: 0, value: camera.alpha })
      attrs.first[2].push({ frame: 0, value: camera.beta })
      attrs.first[3].push({ frame: 0, value: camera.radius })
      attrs.first[4].push({ frame: 0, value: camera.target.clone() })

      $.each( currModel.flythrough, function(idx,keyframe) {
        var frame = keyframe.frame - startFrame + frameRate;

        var dp = [
          { frame: frame, value: vector3FromHash(keyframe.position)},
          { frame: frame, value: keyframe.alpha },
          { frame: frame, value: keyframe.beta },
          { frame: frame, value: keyframe.radius },
          { frame: frame, value: vector3FromHash(keyframe.target)}
        ];

        if ( idx == 0 ) {
          $.each(attrs.first,  function(idx,obj){ obj.push(dp[idx]) })
          $.each(attrs.middle, function(idx,obj){ obj.push(dp[idx]) })
        } else if ( idx == idxSecondToLastFrame ) {
          $.each(attrs.middle, function(idx,obj){ obj.push(dp[idx]) })
          $.each(attrs.last,   function(idx,obj){ obj.push(dp[idx]) })
        } else if ( idx == idxLastFrame ) {
          $.each(attrs.last,   function(idx,obj){ obj.push(dp[idx]) })
        } else {
          $.each(attrs.middle, function(idx,obj){ obj.push(dp[idx]) })
        }

        lastFrame = frame;
      })

      for ( var idx = 0; idx < 5; idx++ ) {
        anims.first[idx].setKeys( attrs.first[idx] )
        anims.middle[idx].setKeys( attrs.middle[idx] )
        anims.last[idx].setKeys( attrs.last[idx] )
      }

      if (evt && evt.autoExitAfterFlythrough){ TDHelpers.__setupAutoExit = true}

      currFlythrough = new BABYLON.Animatable(
        scene, camera, 0, anims.middle[0]._keys[0].frame,false, 1,
        function() {
          if ( currFlythrough == null ) {
            return ButtonHelpers.toggle("butPlay", "butPause")
          }

          currFlythrough = new BABYLON.Animatable(
            scene, camera, anims.middle[0]._keys[0].frame,
            anims.last[0]._keys[0].frame, false, 1,
            function() {
              if ( currFlythrough == null ) {
                return ButtonHelpers.toggle("butPlay", "butPause")
              }

              currFlythrough = new BABYLON.Animatable(
                scene, camera, anims.last[0]._keys[0].frame,
                lastFrame + frameRate, false, 1,
                function() {
                  currFlythrough = null
                  scene.onPointerDown = null
                  new BABYLON.SubMesh(3, 0, skyboxMesh.getTotalVertices(),
                                      0, skyboxMesh.getTotalIndices(),
                                      skyboxMesh);
                  ButtonHelpers.toggle("butPlay", "butPause")
                  if ( TDHelpers.__setupAutoExit ) {
                    TDHelpers.setupAutoExit()
                    delete TDHelpers.__setupAutoExit
                  }
                }, anims.last)
              currFlythrough.disposeOnEnd = true
            }, anims.middle)
          currFlythrough.disposeOnEnd = true
        }, anims.first)
      currFlythrough.disposeOnEnd = true

      scene.onPointerDown = function(e) {
        var ref = currFlythrough;
        currFlythrough = null
        try { ref.stop() } catch (exp) {}
        scene.onPointerDown = null;
      }
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
  }
}
