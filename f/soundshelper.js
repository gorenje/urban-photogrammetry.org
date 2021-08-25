var SoundsHelper = {
  AllSounds: {},

  load: function(scene) {
    var assetsManager = new BABYLON.AssetsManager(scene);

    var soundReady = function() {}

    $.each( UPModels.AvailableModels, function(idx,model) {
      var binaryTask = assetsManager.addBinaryFileTask(
        model.mlid,
        "/f/sounds/" + model.sound
      );
      binaryTask.onSuccess = function(task) {
        SoundsHelper.AllSounds[task.name] = new BABYLON.Sound(
          task.name, task.data, scene, soundReady,
          {
            loop: true,
            spatialSound: true,
            distanceModel: "exponential",
            rolloffFactor: 1
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
    if (SoundsHelper.AllSounds[mlid] && SoundsHelper.AllSounds[mlid].isReady()){
      SoundsHelper.AllSounds[mlid].play()
    }
  }
}
