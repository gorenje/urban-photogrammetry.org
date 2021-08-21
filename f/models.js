var UPModels = {

  AvailableModels: [
    {
      mlid: "0ec35096975442188f5278665013bfae",
      text: "0ec35096975442188f5278665013bfae",
      camera: {
        x: 5.13624105098844,
        y: 0.4779500405644348,
        z: -6.908086630468551,
        alpha: -0.9363488829221098,
        beta: 1.6628294063648217,
        radius: 8.290024931586851,
      },
      rotate: 1.25
    },
    {
      mlid: "70fcd5892cb346429c04c1d852b96169",
      text: "70fcd5892cb346429c04c1d852b96169",
      camera: {
        x: 2.2086620288933587,
        y: 0.43628103102516497,
        z: -2.084873259192153,
        alpha: -0.7760185511836794,
        beta: 1.6813936038885955,
        radius: 2.753551603849583,
      },
      rotate: 1.20
    },
    {
      mlid: "3d0f151bf808494a9eb1b2a81665e832",
      text: "3d0f151bf808494a9eb1b2a81665e832",
      camera: {
        x: 0.8715815264758092,
        y: 1.90001145707926,
        z: -8.49933782353673,
        alpha: -1.4946899544083658,
        beta: 1.491076267333708,
        radius: 8.290024931586851,
      },
      rotate: -0.25
    },
  ],

  init: function() {
    return this.AvailableModels[0];
  },

  next: function(mlid) {
    var currIdx = 0;
    if ( typeof mlid == "object" ) mlid = mlid.mlid;

    for ( var idx = 0; idx < this.AvailableModels.length; idx++ ) {
      if ( this.AvailableModels[idx].mlid == mlid ) {
        currIdx = idx;
        break;
      }
    }
    var nextIdx = currIdx + 1;
    if ( nextIdx >= this.AvailableModels.length ) nextIdx = 0;

    return this.AvailableModels[nextIdx];
  },

  previous: function(mlid) {
    var currIdx = 0;
    if ( typeof mlid == "object" ) mlid = mlid.mlid;

    for ( var idx = 0; idx < this.AvailableModels.length; idx++ ) {
      if ( this.AvailableModels[idx].mlid == mlid ) {
        currIdx = idx;
        break;
      }
    }

    var prevIdx = currIdx - 1;
    if ( prevIdx < 0 ) prevIdx = this.AvailableModels.length - 1;

    return this.AvailableModels[prevIdx];
  }

}
