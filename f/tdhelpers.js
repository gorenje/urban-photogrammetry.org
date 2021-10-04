// Three-D Helpers
var TDHelpers = {
  disableWebGL2: function() {
    return window.browser.satisfies( {
      mobile: {
        safari: "=13.1.1"
      }
    } ) || false;
  },

  average: function(ary) {
    return ary.reduce( (a,b) => a + b, 0 ) / ary.length
  },

  isMobile: function() {
    return window.browser.getPlatformType() == "mobile"
  },

  modelHost: function() {
    if ( window.location.hostname == "localhost" ) {
      return "http://localhost:4003"
    } else {
      return "https://m.urban-photogrammetry.org"
    }

    return window.browser.getPlatformType() == "mobile"
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

  resize: function() {
    let winWidth = window.innerWidth;
    let winHeight = window.innerHeight;

    let aspectRatio = 0.5625; // 16:9 ~ 1.7777....
    let canvas = engine.getRenderingCanvas()

    let heightBased = {
      width: Math.round(winHeight * aspectRatio),
      height: winHeight,
    }
    let widthBased = {
      width: winWidth,
      height: Math.round(winWidth / aspectRatio)
    }
    let whatToUse = undefined;

    if ( winWidth > winHeight ) {
      whatToUse = heightBased
      if ( whatToUse.width > winWidth ) { whatToUse = widthBased }
    } else {
      whatToUse = widthBased
      if ( whatToUse.height > winHeight ) { whatToUse = heightBased }
    }
    canvas.width = whatToUse.width
    canvas.height = whatToUse.height
  },

  parseShareLink(url) {
    var urlhash = new URL(url).hash
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

  checkForShareData(url) {
    var urlhash = new URL(url).hash
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
      // .51,.18,.49,.79
      anim.setEasingFunction(new BABYLON.BezierCurveEase(.51,.18,.49,.79))
    });

    return anims;
  }
}
