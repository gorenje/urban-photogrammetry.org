var MapHelper = {
  AvailableModels: ModelsForMap,

  AllButtons: {},

  addButton: function(name, left, top, callback = undefined, icon_name = undefined) {
    var img = document.createElement('img')

    img.style = `position: absolute; top: ${top}%; left: ${left}%; width: 7vw; background-color: #00000033; border-width: 1px; border-color: #ffffff88; border-style: solid; border-radius: 10px; pointer-events: auto;`
    img.src = ButtonHelpers.ImageMap[icon_name || name]
    img.onclick = callback || function(){};

    $('#mapbuttons').append( img )
    MapHelper.AllButtons[name] = img;

    return img;
  },

  addModelTitle: function(mlid) {
    var img = document.createElement('div')

    img.id = "modeltitle"
    img.style = `display: none; position: absolute; top: 30%; left: 30%; height: 15vh; width: 30vw; background-color: #000000aa; border-width: 1px; border-color: #ffffff88; border-style: solid; border-radius: 10px; color: #eee;text-align: center; pointer-events: auto;`

    $('#mapbuttons').append( img )

    img.innerHTML = "<strong class='d-inline-block h1 align-text-bottom text-center' style='margin-top: 30%;'>" + ModelNames[mlid].title + "</strong><span style='position: absolute;  right: 0;  bottom: 0;  padding: 1px 3px;  font: 13px sans-serif;  z-index: 10;  white-space: nowrap;  text-overflow: ellipsis;  overflow: hidden;  max-width: 100%;'><a target=_blank href='/berlin/" + mlid + "'>More details</a></span><img width='40px' height='40px' src='"+ButtonHelpers.ImageMap["butLoader"]+"'/>";

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
  },

  onSceneReadyCallback: function(cb) {
    if ( scene && scene.isReady() ) { return cb() }
    setTimeout(function() { MapHelper.onSceneReadyCallback(cb) }, 300)
  },

  examineModel: function(mlid, opts = {}) {
    console.log( "Examing model: " + mlid)
    $(window).trigger('model:show', mlid)

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

      if ( scene ) {
        var timestamp = Date.now()
        scene.onReadyObservable.addOnce(function() {
          $('#modeltitle').fadeOut(Math.max(300, 3000 - (Date.now() - timestamp)), function() {
            $('#map').fadeOut(100)
            $('#3dcanvas').fadeIn(100, function() {
              if ( currModel.sharecamera ) {
                defineIntroAnim(currModel, scene)()
              }
              (opts.callback || function(){})()
            })
            $('#modeltitle').remove()
          })
        })
      } else {
        $('#modeltitle').fadeOut(3000, function() {
          $('#modeltitle').remove()
          $('#map').fadeOut(400)
          $('#3dcanvas').fadeIn(400, function() {
            if ( currModel.sharecamera ) {
              MapHelper.onSceneReadyCallback( function() {
                defineIntroAnim(currModel, scene)()
              })
            }
            if (opts.callback) {MapHelper.onSceneReadyCallback(opts.callback)}
          })
        })
      }
    })
  },

  createStreetMap: function() {
    var browser = bowser.getParser(window.navigator.userAgent);
    var shareData = TDHelpers.parseShareLink(window.location)
    $(window).off('infoscreen:close', MapHelper.createStreetMap)

    var hideinfoscreen = function(event, data) {
      if ( data.frameNr == 2 ) {
        $('#infoScreen').fadeOut(300)
        $(window).off('keyframe:moveto', hideinfoscreen)
        $(window).off('infoscreen:hide', hideinfoscreen)
      }
    };
    $(window).on('keyframe:moveto', hideinfoscreen)
    $(window).on('infoscreen:hide', hideinfoscreen)

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
          $(MapHelper.AllButtons["butLoader"]).hide()
          $(MapHelper.AllButtons["butCopied"]).show()
          setTimeout( function() {
            $(MapHelper.AllButtons["butShare"]).show()
            $(MapHelper.AllButtons["butCopied"]).hide()
          }, 2500)
        } catch ( e ) {}
      }).error(function(err){
        try {
          TDHelpers.copyToClipboard( shareUrl )
          $(MapHelper.AllButtons["butLoader"]).hide()
          $(MapHelper.AllButtons["butCopied"]).show()
          setTimeout( function() {
            $(MapHelper.AllButtons["butShare"]).show()
            $(MapHelper.AllButtons["butCopied"]).hide()
          }, 2500)
        } catch ( e ) {}
      })

      try {
        navigator.share({
          title: "Link to Urban-Photogrammetry.org",
          url: shareUrl
        })
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

    MapHelper.addButton( "butLoader1", 45, 5, function(){}, "butLoader");
    $(MapHelper.AllButtons["butLoader1"]).hide()

    MapHelper.addButton( "butNav", 45, 5, function() {
      var func = function() {
        $(MapHelper.AllButtons["butLoader1"]).hide()
        $(MapHelper.AllButtons["butNav"]).show()
        $(window).off("movetopos:complete", func);
      }
      $(window).on("movetopos:complete",func);

      $(MapHelper.AllButtons["butLoader1"]).show()
      $(MapHelper.AllButtons["butNav"]).hide()

      MapAnimation.pause()
      $(MapHelper.AllButtons["butPlay"]).show()
      $(MapHelper.AllButtons["butPause"]).hide()

      MapAnimation.moveToPos({"zoom":15.999999999999996,
                           "position_latitude":52.521959731734135,
                           "position_longitude":13.40975201573759,
                           "tilt":13.245142620917735,
                           "rotation":24.57576092466016})
    })

    MapHelper.addButton( "butCopied", 90, 93, function() {
      $(MapHelper.AllButtons["butShare"]).show()
      $(MapHelper.AllButtons["butCopied"]).hide()
    })
    $(MapHelper.AllButtons["butCopied"]).hide()

    MapHelper.addButton( "butLoader", 90, 93 )
    $(MapHelper.AllButtons["butLoader"]).hide()

    MapHelper.addButton( "butShare", 90, 93, function() {
      $(MapHelper.AllButtons["butShare"]).hide()
      $(MapHelper.AllButtons["butLoader"]).show()
      map.emit('sharelink')
    })

    if ( TDHelpers.isLocalhost() ) {
      MapHelper.addButton( "butExit", 90, 5, function() {
        map.emit('keyframe')
      })
      MapHelper.addButton( "butMute", 90, 10, function() {
        scene.debugLayer.show({ embedMode: true });
      })
    }

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
