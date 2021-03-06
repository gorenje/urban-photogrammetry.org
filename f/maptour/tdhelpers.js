// Three-D Helpers
var TDHelpers = {
  disableWebGL2: function() {
    if ( !window.browser ) {
      window.browser = bowser.getParser(window.navigator.userAgent);
    }

    return window.browser.satisfies( {
      safari: ">0"
    } ) || false;
  },

  average: function(ary) {
    return ary.reduce( (a,b) => a + b, 0 ) / ary.length
  },

  isMobile: function() {
    if ( !window.browser ) {
      window.browser = bowser.getParser(window.navigator.userAgent);
    }
    return window.browser.getPlatformType() == "mobile"
  },

  isLocalhost: function() {
    return window.location.hostname == "localhost"
  },

  isFullscreen: function() {
    return !!(document.fullscreenElement ||
              document.mozFullScreenElement ||
              document.webkitFullscreenElement ||
              document.msFullscreenElement);
  },

  osmTileHost: function() {
    if ( TDHelpers.isLocalhost() ) {
      return "http://localhost:4001"
    }
    return "https://t.urban-photogrammetry.org"
  },

  geoTileHost: function() {
    if ( TDHelpers.isLocalhost() ) {
      return "http://localhost:4002"
    }
    return "https://g.urban-photogrammetry.org"
  },

  modelHost: function() {
    if ( TDHelpers.isLocalhost() ) {
      return "http://localhost:4003"
    }
    return "https://m.urban-photogrammetry.org"
  },

  // From https://davidwalsh.name/fullscreen
  // Find the right method, call on correct element
  launchIntoFullscreen: function(element) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  },

  // Whack fullscreen
  exitFullscreen: function() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  },

  copyToClipboard: function(content) {
    var tempInput = document.createElement("input");
    tempInput.style = "position: absolute; left: -1000px; top: -1000px";
    tempInput.value = content;
    document.body.appendChild(tempInput);

    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
  },

  setupAutoExit: function(start_after = 2000) {
    MapHelper.showTextMV({
      title: "Controls - Exit Button",
      button: "butExit",
      text: "Automatically exiting the model viewer. Click here to prevent exiting viewer.",
      callback: function() {
        clearTimeout(autoExitTimeout)
        $(ButtonHelpers.AllButtons["butExit"]).css('background-color',"#00000033");
      }
    }).fadeIn(200, function() {
      autoExitTimeout = setTimeout( function() {
        var button = ButtonHelpers.AllButtons["butExit"]
        autoExitTimeout = setTimeout( function() {
          $(button).css("background-color", '#ff000033')
          autoExitTimeout = setTimeout( function() {
            $(button).css("background-color", '#f0f00033')
            autoExitTimeout = setTimeout( function() {
              $(button).css("background-color", '#ff000033')
              autoExitTimeout = setTimeout( function() {
                $(button).css("background-color", '#f0f00033')
                autoExitTimeout = setTimeout( function() {
                  $(button).css("background-color", '#ff000033')
                  autoExitTimeout = setTimeout( function() {
                    $(button).css("background-color", '#f0f00033')
                    autoExitTimeout = setTimeout( function() {
                      ButtonHelpers.CB.exit()
                      MapHelper.hideText()
                      $(button).css("background-color", '#00000033')
                    }, 300);
                  }, 300);
                }, 300);
              }, 300);
            }, 300);
          }, 300);
        }, 300)
      }, start_after )
    })
  },

  resize: function() {
    let canvas = engine.getRenderingCanvas()
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    $('#viewerbuttons').css(`width: ${window.innerWidth}px; height: ${window.innerHeight}px;`)
  },

  parseShareLink: function(url) {
    var urlhash = new URL(url).hash || new URL(url).search.replace("?l=","#")
    if ( urlhash !== "" ) {
      try {
        var data = JSON.parse(atob(urlhash.substring(1)))

        if ( data.t == "e" ) {
          return {
            t: 'e',
            model: TDHelpers.checkForShareData(url),
            pos: MapHelper.AvailableModels.filter( function(obj) {
              return obj.mlid == data.o
            } )[0]
          }
        }

        if ( data.t == "m" ) {
          return {
            t: 'm',
            pos: data
          }
        }
      } catch (e) {
        return undefined;
      }
    }
    return undefined;
  },

  checkForShareData: function(url) {
    var urlhash = new URL(url).hash || new URL(url).search.replace("?l=","#")
    if ( urlhash !== "" ) {
      try {
        var data = JSON.parse(atob(urlhash.substring(1)))

        var model = UPModels.modelForMlid(data.o)

        if ( data.tx !== undefined && data.px !== undefined ) {
          var sharecamera = {
            target:   new BABYLON.Vector3(data.tx, data.ty, data.tz),
            position: new BABYLON.Vector3(data.px, data.py, data.pz),
            alpha:    data.a,
            beta:     data.b,
            radius:   data.r
          }
          model.sharecamera = sharecamera
        }

        return model
      } catch ( e ) {
        return UPModels.init()
      }
    } else {
      return UPModels.init()
    }
  },

  prepareAnimations: function(frameRate) {
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
      new BABYLON.Animation(
        "targetting",
        "target",
        frameRate,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      ),
    ]

    $.each( anims, function(idx, anim) {
      // see https://cubic-bezier.com/#.51,.18,.49,.79
      anim.setEasingFunction(new BABYLON.BezierCurveEase(.51,.18,.49,.79))
    });

    return anims;
  },

  prepareAnimationsFirstMiddleLast: function(frameRate) {
    var first  = TDHelpers.prepareAnimations(frameRate)
    var middle = TDHelpers.prepareAnimations(frameRate)
    var last   = TDHelpers.prepareAnimations(frameRate)

    $.each( first, function(idx, anim) {
      var easingFunction = new BABYLON.CircleEase();
      easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN);
      anim.setEasingFunction(easingFunction)
    });

    $.each( middle, function(idx, anim) {
      anim.setEasingFunction(undefined)
    });

    $.each( last, function(idx, anim) {
      var easingFunction = new BABYLON.CircleEase();
      easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
      anim.setEasingFunction(easingFunction)
    });

    return { first: first, middle: middle, last: last };
  }
}
