var UPModels = {

  AvailableModels: [
    {
      mlid: "0ec35096975442188f5278665013bfae",
      text: "0ec35096975442188f5278665013bfae",
      rotate: 1.25
    },
    {
      mlid: "70fcd5892cb346429c04c1d852b96169",
      text: "70fcd5892cb346429c04c1d852b96169",
      rotate: 1.20
    },
    {
      mlid: "3d0f151bf808494a9eb1b2a81665e832",
      text: "3d0f151bf808494a9eb1b2a81665e832",
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
