var ModelCache = {
  Cache: {
  },

  cachePrevAndNext: function(mlid) {
    var prevMlid = UPModels.previous(mlid).mlid;
    var nextMlid = UPModels.next(mlid).mlid;

    ModelCache.fetchAndStore("/m/"+nextMlid+"/background-64.jpg")
    ModelCache.fetchAndStore("/m/"+prevMlid+"/background-64.jpg")
    ModelCache.fetchAndStore("/m/"+nextMlid+"/model-512.glb")
    ModelCache.fetchAndStore("/m/"+prevMlid+"/model-512.glb")
  },

  fetchAndStore: function(idxname) {
    if ( ModelCache.Cache[idxname] != undefined ) return;

    fetch(idxname).then((val) => {
      val.blob().then( blb => {
        var myReader = new FileReader();
        myReader.onload = function() {
            ModelCache.Cache[idxname] = this.result
        };
        myReader.readAsDataURL(blb)
      })
    })
  },

  getEntry: function(idx) {
    // one time cache, since we don't want any bloat here and models and
    // images are generally only requested once.
    var v = ModelCache.Cache[idx];
    delete ModelCache.Cache[idx]
    return v;
  },


}
