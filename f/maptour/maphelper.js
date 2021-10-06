var MapHelper = {
  AvailableModels: ModelsForMap,

  AllButtons: {},

  addButton: function(name, left, top, callback) {
    var img = document.createElement('img')

    img.style = `position: absolute; top: ${top}%; left: ${left}%; width: 7vw; background-color: #00000033; border-width: 1px; border-color: #ffffff88; border-style: solid; border-radius: 10px; pointer-events: auto;`
    img.src = ButtonHelpers.ImageMap[name]
    img.onclick = callback;

    $('#mapbuttons').append( img )
    MapHelper.AllButtons[name] = img;

    return img;
  },

  addModelTitle: function(mlid) {
    var img = document.createElement('div')

    img.id = "modeltitle"
    img.style = `display: none; position: absolute; top: 30%; left: 30%; height: 15vh; width: 30vw; background-color: #000000aa; border-width: 1px; border-color: #ffffff88; border-style: solid; border-radius: 10px; color: #eee;text-align: center;`

    $('#mapbuttons').append( img )
    img.innerHTML = "<strong class='d-inline-block h1 align-text-bottom text-center' style='margin-top: 30%;'>" + ModelNames[mlid].title + "</strong>"

    return img;
  },

  addObj: function(idx,obj, prefix="") {
    map.addOBJ(`${TDHelpers.modelHost()}/m/${obj.mlid}/${prefix}lods.obj#${idx}`,
                {
                  latitude: obj.loc[0],
                  longitude: obj.loc[1]
                },
                {
                  scale:    obj.scale,
                  altitude: obj.altitude || 0,
                  color:    'red',
                  id:       'up-' + obj.mlid,
                  rotation: obj.rotation
                }
              );
  },

  addSmallerObj: function(idx,obj) {
    MapHelper.addObj(idx,obj,"smaller-")
  },

  currentVisibleModels: function() {
    var mapBnds = map.getBounds()

    var bnds = L.latLngBounds(
      L.latLng(mapBnds[0].latitude, mapBnds[0].longitude),
      L.latLng(mapBnds[2].latitude, mapBnds[2].longitude)
    ).extend(
      L.latLngBounds(
        L.latLng(mapBnds[1].latitude, mapBnds[1].longitude),
        L.latLng(mapBnds[3].latitude, mapBnds[3].longitude)
      )
    )

    var models = MapHelper.AvailableModels.filter( function(model) {
      return bnds.contains(model.latLngPt)
    })

    models.sort( function(model1,model2) {
      return ( bnds.getCenter().distanceTo( model1.latLngPt ) -
               bnds.getCenter().distanceTo( model2.latLngPt ) )
    })

    return models;
  },

  modelExaminerDone: function() { // callback from the model navigator
    $(MapHelper.AllButtons["butPlay"]).hide()
    $(MapHelper.AllButtons["butPause"]).show()
    MapAnimation.play()
    clearScene(scene, skyboxMesh, alltextures)
  },

  playIntroAnim: function () {
    if ( scene.isReady() ) {
      defineIntroAnim(currModel, scene)()
    } else {
      setTimeout(MapHelper.playIntroAnim, 300)
    }
  },

  examineModel: function(mlid, opts = {}) {
    console.log( "Examing model: " + mlid)

    var txt = MapHelper.addModelTitle(mlid);
    MapAnimation.pause()
    $(MapHelper.AllButtons["butPlay"]).show()
    $(MapHelper.AllButtons["butPause"]).hide()

    $('#modeltitle').fadeIn(300, function() {
      if ( engine == null ) {
        displayModel(mlid, opts.model_details)
      } else {
        clearScene(scene, skyboxMesh, alltextures)

        // reconstruction
        currModel      = opts.model_details || UPModels.modelForMlid(mlid)
        var r          = createSkyBox(scene)
        skyboxMesh     = r[0]
        multimat       = r[1]

        loadSkyBoxMaterial(currModel.mlid, baseMaterialSizes[0],
                           alltextures, multimat,scene)
        addKeyboardObserver(scene, skyboxMesh);
        loadModel(currModel, scene, skyboxMesh, multimat, baseMaterialSizes)
      }

      $('#modeltitle').fadeOut(3000, function() {
        $('#modeltitle').remove()
        $('#map').fadeOut(400, function() {
          $('#3dcanvas').fadeIn(400, function() {
            if ( currModel.sharecamera ) { MapHelper.playIntroAnim() }
            (opts.callback || function(){})();
          })
        })
      })
    })
  },

  createStreetMap: function() {
    var browser = bowser.getParser(window.navigator.userAgent);
    var shareData = TDHelpers.parseShareLink(window.location)

    $('#loadingScreen').hide()
    $('#3dcanvas').hide()

    var loc = { longitude: MapHelper.AvailableModels[0].loc[1],
                latitude: MapHelper.AvailableModels[0].loc[0] }

    map = new OSMBuildings({
      container: 'map',
      position: loc,
      zoom: 17,
      minZoom: 15,
      rotation: 39,
      maxZoom: 21,
      tilt: 45,
      attribution: '© Map & Data <a href="https://openstreetmap.org/copyright/">OpenStreetMap</a>© 3D <a href="https://osmbuildings.org/copyright/">OSM Buildings</a>© 3D <a href="https://urban-photogrammetry.org">Urban Models</a>',
    })

    map.on('keyframe', function() {
      var data = {
        zoom: map.getZoom(),
        position_latitude: map.getPosition().latitude,
        position_longitude: map.getPosition().longitude,
        tilt: map.getTilt(),
        rotation: map.getRotation()
      }
      TDHelpers.copyToClipboard(JSON.stringify(data)+",")
      console.log(JSON.stringify(data)+",")
    });

    map.on('sharelink', function() {
      var data = {
        zm: map.getZoom(),
        lt: map.getPosition().latitude,
        lg: map.getPosition().longitude,
        tl: map.getTilt(),
        r:  map.getRotation(),
        t:  'm',
      }
      var url = new URL(window.location)
      var shareUrl = url.origin + url.pathname + "?l=" + window.btoa(
        JSON.stringify(data));

      try {
        navigator.share({ title: "Link to Model", url: shareUrl })
      } catch ( e ) {}

      try {
        TDHelpers.copyToClipboard( shareUrl )
        $(MapHelper.AllButtons["butShare"]).hide()
        $(MapHelper.AllButtons["butCopied"]).show()
        setTimeout( function() {
          $(MapHelper.AllButtons["butShare"]).show()
          $(MapHelper.AllButtons["butCopied"]).hide()
        }, 2500)
      } catch ( e ) {}

      console.log( shareUrl )
    });

    const lodUrlRg = /m\/([^/]+)\/lods.obj#([0-9]+)/i;

    window.addEventListener('message', (event) => {
      if ( event.data && event.data.type && event.data.type == "error-lod" &&
           event.data.url.match(lodUrlRg) ) {

        var obj = MapHelper.AvailableModels[parseInt(
          event.data.url.match(lodUrlRg)[2])]

        setTimeout( function() {
          try { MapHelper.addSmallerObj("1",obj) } catch (e) { console.log(e) }
        }, Math.ceil(100 * Math.random()) + 10);
      }
    })

    $.each( MapHelper.AvailableModels, function(idx, obj) {
      if (shareData && shareData.t == 'e' && shareData.model.mlid == obj.mlid) {
        try { MapHelper.addObj(idx,obj) } catch (e ) { console.log(e) }
      } else {
        setTimeout( function() {
          try { MapHelper.addObj(idx,obj) } catch (e ) { console.log(e) }
        }, Math.ceil(100 * Math.random()) + 10);
      }
    })

    map.addMapTiles(`${TDHelpers.osmTileHost()}/f/images/tiles/{z}/{x}/{y}.png`)
    map.addGeoJSONTiles(
      `${TDHelpers.geoTileHost()}/f/images/geotiles/{z}/{x}/{y}.json`
    );

    let sze = {
      width: map.container.offsetWidth,
      height: map.container.offsetHeight
    };

    if ( map.container.offsetWidth == 0 && map.container.offsetHeight == 0 ) {
      if ( window.fullScreen || (window.innerWidth == screen.width &&
                                 window.innerHeight == screen.height)) {
        sze = { width: screen.width, height: screen.height }
      } else {
        sze = { width: window.innerWidth, height: window.innerHeight }
      }
    }

    map.setSize( sze.width, sze.height )
    map.events.emit( 'resize', sze )

    $('#mapbuttons').css('width', `${sze.width}px`);
    $('#mapbuttons').css('height', `${sze.height}px`);

    MapHelper.addButton( "butCopied", 90, 93, function() {
      $(MapHelper.AllButtons["butShare"]).show()
      $(MapHelper.AllButtons["butCopied"]).hide()
    })
    $(MapHelper.AllButtons["butCopied"]).hide()
    MapHelper.addButton( "butShare", 90, 93, function() {
      map.emit('sharelink')
    })

    // MapHelper.addButton( "butExit", 90, 5, function() {
    //   map.emit('keyframe')
    // })

    MapHelper.addButton( "butPlay", 45, 93, function() {
      $(MapHelper.AllButtons["butPlay"]).hide()
      $(MapHelper.AllButtons["butPause"]).show()
      MapAnimation.play()
    })

    MapHelper.addButton( "butPause", 45, 93, function() {
      $(MapHelper.AllButtons["butPlay"]).show()
      $(MapHelper.AllButtons["butPause"]).hide()
      MapAnimation.pause()
    })

    $(MapHelper.AllButtons["butPause"]).hide()

    if ( shareData != undefined ) {
      setTimeout( function() {
        if ( MapAnimation.moveToShareData(shareData) ) {
          $(MapHelper.AllButtons["butPause"]).show()
          $(MapHelper.AllButtons["butPlay"]).hide()
        }
      }, 1000)
    } else {
      setTimeout(function() {
        $(MapHelper.AllButtons["butPlay"]).hide()
        $(MapHelper.AllButtons["butPause"]).show()
        MapAnimation.start()
      }, 1500)
    }

    map.on('pointerdown', e => {
      MapAnimation.pause()
      $(MapHelper.AllButtons["butPlay"]).show()
      $(MapHelper.AllButtons["butPause"]).hide()
    });

    map.on('pointerup', e => {
      $.each( e.features || [], function(idx,obj) {
        if ( obj.id.substring(0,3) === "up-" ) {
          MapHelper.examineModel(obj.id.substring(3))
        }
      })
    });
  }
};

$(function(){
  $.each(MapHelper.AvailableModels, function(idx,obj){
    obj.latLngPt = L.latLng(obj.loc[0], obj.loc[1])
  })
})