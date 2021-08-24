// Three-D Helpers
var TDHelpers = {
  disableWebGL2: function(browser) {
    return browser.satisfies( { mobile: { safari: "=13.1.1" } } ) || false;
  },

  checkForShareData(url) {
    var urlhash = new URL(url).hash
    if ( urlhash !== "" ) {
      try {
        var data = JSON.parse(atob(urlhash.substring(1)))

        var sharecamera = {
          target:   new BABYLON.Vector3(data.tx, data.ty, data.tz),
          position: new BABYLON.Vector3(data.px, data.py, data.pz),
          alpha:    data.a,
          beta:     data.b,
          radius:   data.r
        }

        var model = UPModels.modelForMlid(data.o)
        model.sharecamera = sharecamera
        return model
      } catch ( e ) {
        return UPModels.init()
      }
    } else {
      return UPModels.init()
    }
  },

  prepareAnimations: function(frameRate) {
    return [
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
  }
}
