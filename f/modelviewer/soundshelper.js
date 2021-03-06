var muteOn = true;

var SoundsHelper = {
  AllSounds: {},

  load: function(scene) {
    var assetsManager = new BABYLON.AssetsManager(scene);

    $.each( UPModels.AvailableModels, function(idx,model) {
      var binaryTask = assetsManager.addBinaryFileTask(
        model.mlid,
        "/f/sounds/" + model.sound
      );

      binaryTask.onSuccess = function(task) {
        SoundsHelper.AllSounds[task.name] = new BABYLON.Sound(
          task.name, task.data, scene, function() {},
          {
            loop: true,
            spatialSound: true,
            distanceModel: "exponential",
            rolloffFactor: 1,
            autoplay: false,
          });
      };
    })

    assetsManager.load();
  },

  stopAll: function() {
    $.each( SoundsHelper.AllSounds, function(k,v) { v.stop() })
  },

  playModel: function(mlid) {
    SoundsHelper.stopAll()

    if (muteOn == false && SoundsHelper.AllSounds[mlid] &&
        SoundsHelper.AllSounds[mlid].isReady()){
      SoundsHelper.AllSounds[mlid].play()
    }
  }
}
