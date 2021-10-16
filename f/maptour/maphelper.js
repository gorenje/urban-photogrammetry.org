var MapHelper = {
  AvailableModels: ModelsForMap,

  AllButtons: {},

  showEndOfTourText: function(callback = undefined) {
    var img = document.createElement('div')

    img.id = "eottextbox"
    img.className = "infotextbox"
    img.style = "display: none;"
    img.onclick = callback || function(){};

    $('#mapbuttons').append( img )

    img.innerHTML = "<strong>End of Tour</strong><p><span>Thanks for watching and we hope you enjoyed it.</span><img class='closer' src='"+ButtonHelpers.ImageMap["butExit"]+"'/><p>[<a target=_blank href='http://urban-photogrammetry.org'>Home</a>]&nbsp;[<a target=_blank href='mailto:info@urban-photogrammetry.org'>Contact</a>]";

    return img;
  },

  showModelTitle: function(mlid) {
    var img = document.createElement('div')

    img.id = "modeltitle"
    img.className = "modeltextbox"
    img.style = "display: none;"

    $('#mapbuttons').append( img )

    img.innerHTML = "<strong>" + ModelNames[mlid].title + "</strong><span class='moredetails'><a target=_blank href='/berlin/" + mlid + "'>More details</a></span><img class='loader' src='"+ButtonHelpers.ImageMap["butLoader"]+"'/>";

    return img;
  },

  showInfoText: function(callback = undefined) {
    var img = document.createElement('div')

    img.id = "infotextbox"
    img.className = "infotextbox"
    img.style = "display: none;"
    img.onclick = callback || function(){};

    $('#mapbuttons').append( img )

    img.innerHTML = "<strong>Urban Photogrammetry</strong><p><span>Three-Dimensionalisation of urban spaces.<p>Presenting a 3D virtual tour of Berlins cultural history.</span><img class='closer' src='"+ButtonHelpers.ImageMap["butExit"]+"'/><p>[<a target=_blank href='http://urban-photogrammetry.org'>Home</a>]&nbsp;[<a target=_blank href='mailto:info@urban-photogrammetry.org'>Contact</a>]";

    return img;
  },

  hideText: function(cb = function(){}) {
    $('#showtextbox').fadeOut(400, function() {
      $('#showtextbox').remove()
      cb()
    })
  },

  showText: function(content = { title: "", text: "" }) {
    var img = document.createElement('div')

    img.id = "showtextbox"
    img.className = "infotextbox"
    img.style = "display: none;"
    img.onclick = MapHelper.hideText;

    $('#mapbuttons').append( img )

    if ( content.button ) {
      img.innerHTML = "<strong>"+content.title+"</strong><p><div class='row'>"+
                      "<div class='col-3'><img class='mapbutton' style='width: 40px;' src='" + ButtonHelpers.ImageMap[content.button] + "'/></div><div class='col-9'>"+content.text + "</div></div><img class='closer' src='" +
                      ButtonHelpers.ImageMap["butExit"] + "'/>";
    } else {
      img.innerHTML = "<strong>"+content.title+"</strong><p><span>"+content.text +
                      "</span><img class='closer' src='" +
                      ButtonHelpers.ImageMap["butExit"] + "'/>";
    }

    return $(img);
  },

  addButton: function(name, cssClass, callback = undefined, icon_name = undefined) {
    var img = document.createElement('img')

    img.className = `mapbutton ${cssClass}`
    img.src = ButtonHelpers.ImageMap[icon_name || name]
    img.onclick = callback || function(){};

    $('#mapbuttons').append( img )
    MapHelper.AllButtons[name] = img;

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
                  color:    '#ff911e',
                  id:       'up-' + obj.mlid,
                  rotation: obj.rotation
                }
              );
  },

  hide: function(buttonName) {
    $(MapHelper.AllButtons[buttonName]).hide()
  },

  fadeIn: function(buttonName) {
    $(MapHelper.AllButtons[buttonName]).fadeIn(300);
  },

  show: function(buttonName) {
    $(MapHelper.AllButtons[buttonName]).show()
  },

  toggle: function(showButName, hideButName, thirdButName=undefined) {
    MapHelper.show(showButName)
    MapHelper.hide(hideButName)
    if (thirdButName) { MapHelper.hide(thirdButName) }
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
    setTimeout(function() {
      MapAnimation.play()
    }, 500)
  },

  onSceneReadyCallback: function(cb) {
    if ( scene && scene.isReady() ) { return cb() }
    setTimeout(function() { MapHelper.onSceneReadyCallback(cb) }, 300)
  },

  examineModel: function(mlid, opts = {}) {
    console.log( "Examing model: " + mlid)
    $(window).trigger('model:show', mlid)

    var txt = MapHelper.showModelTitle(mlid);
    MapAnimation.pause()

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
            $('#modelviewer').fadeIn(100, function() {
              if ( currModel.sharecamera ) {
                defineIntroAnim(currModel, scene)()
              }
              (opts.callback || function(){})()
              $(window).trigger('modelviewer:showing', currModel.mlid)
            })
            $('#modeltitle').remove()
          })
        })
      } else {
        $('#modeltitle').fadeOut(3000, function() {
          $('#modeltitle').remove()
          $('#map').fadeOut(400)
          $('#modelviewer').fadeIn(400, function() {
            if ( currModel.sharecamera ) {
              MapHelper.onSceneReadyCallback( function() {
                defineIntroAnim(currModel, scene)()
              })
            }
            $(window).trigger('modelviewer:showing', currModel.mlid)
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

    $(window).on('keyframe:moveto', function(event,data) {
      console.log("moving to " + data.frameNr )
    });

    $(window).on('keyframe:moveto', function(event,data) {
      if ( data.frameNr == 2 ) {
        MapHelper.showText({
          title: "Welcome to the Berlin 3D Virtual Tour",
          text: "This tour will visit some of Berlins cultural history - Enjoy!"
        }).fadeIn(300);
      }

      if ( data.frameNr == 4 ) {
        MapHelper.hideText(function(){
          MapHelper.showText({
            title: "Controls - Pause",
            button: "butPause",
            text: "Pause the tour at any time using the pause button."
          }).fadeIn(300);
        })
      }

      if ( data.frameNr == 7 ) {
        MapHelper.showText({
          title: "Controls - Play",
          button: "butPlay",
          text: "Continue the tour by using the play button."
        }).fadeIn(300);
      }

      if ( data.frameNr == 11 ) {
        MapHelper.showText({
          title: "Controls - View",
          button: "butCursor",
          text: "Click on a model to view it more closely."
        }).fadeIn(300);
      }

      if ( data.frameNr == 15 ) {
        MapHelper.showText({
          title: "Controls - Share",
          button: "butShare",
          text: "Share views of models or locations on the map with friends."
        }).fadeIn(300);
      }

      if ( data.frameNr == 19 ) {
        MapHelper.showText({
          title: "Controls - Recenter",
          button: "butNav",
          text: "Reorientate back to the center of the map."
        }).fadeIn(300);
      }

      if ( [6,9,13,17,21].includes(data.frameNr) ) { MapHelper.hideText() }
    })

    $(window).on('mapanin:paused', function() {
      MapHelper.toggle("butPlay","butPause")
    })

    $(window).on('mapanin:playing', function() {
      MapHelper.toggle("butPause","butPlay")
    })

    $(window).on('model:show', function() {
      $("#infotextbox").fadeOut(400, function(){
        $("#infotextbox").remove()
      })
    })
    $(window).on('modelviewer:showing', function() {
      $("#infotextbox").fadeOut(400, function(){
        $("#infotextbox").remove()
      })
    })

    $(window).on('mapanim:tourend', function() {
      var textbox = MapHelper.showEndOfTourText(function(){
        $(textbox).fadeOut(400, function(){
          $(textbox).remove()
        })
      });

      $(textbox).fadeIn(300, function() {
        setTimeout( function() {
          $(textbox).fadeOut(400, function(){
            $(textbox).remove()
          })
        }, 1500)
      });
    })

    $('#loadingScreen').hide()
    $('#modelviewer').hide()

    var firstKeyframe = MapAnimation.keyFrames[0];
    var loc = {
      longitude: firstKeyframe.position_longitude,
      latitude:  firstKeyframe.position_latitude
    }

    map = new OSMBuildings({
      container: 'map',
      position: loc,
      zoom: firstKeyframe.zoom,
      minZoom: 15,
      rotation: firstKeyframe.rotation,
      maxZoom: 21,
      tilt: firstKeyframe.tilt,
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
          MapHelper.toggle("butCopied","butLoader","butShare")
          setTimeout( function() {
            MapHelper.toggle("butShare","butCopied","butLoader")
          }, 2500)
        } catch ( e ) {}

        try {
          navigator.share({
            title: "urban-photogrammetry.org",
            text: "Link to Urban-Photogrammetry.org",
            url: shareUrl
          })
        } catch ( e ) {prompt( "URL", shareUrl)  }
      }).fail(function(err){
        try {
          TDHelpers.copyToClipboard( shareUrl )
          MapHelper.toggle("butCopied","butLoader","butShare")
          setTimeout( function() {
            MapHelper.toggle("butShare","butCopied","butLoader")
          }, 2500)
        } catch ( e ) {}

        try {
          navigator.share({
            title: "urban-photogrammetry.org",
            text: "Link to Urban-Photogrammetry.org",
            url: shareUrl
          })
        } catch ( e ) { prompt( "URL", shareUrl) }
      })
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

    MapHelper.addButton("butLoader1", "navbutton", function(){}, "butLoader");
    MapHelper.hide("butLoader1")

    MapHelper.addButton( "butNav", "navbutton", function() {
      var func = function() {
        MapHelper.toggle("butNav","butLoader1")
        $(window).off("movetopos:complete", func);
      }
      $(window).on("movetopos:complete",func);
      MapHelper.toggle("butLoader1", "butNav")

      MapAnimation.pause()
      MapHelper.toggle("butPlay", "butPause")

      MapAnimation.moveToPos({
        "zoom":15.999999999999996,
        "position_latitude":52.521959731734135,
        "position_longitude":13.40975201573759,
        "tilt":13.245142620917735,
        "rotation":24.57576092466016
      })
    })

    MapHelper.addButton( "butCopied", "sharebutton", function() {
      MapHelper.toggle("butShare", "butLoader", "butCopied")
    })
    MapHelper.hide("butCopied")

    MapHelper.addButton( "butLoader", "sharebutton" )
    MapHelper.hide("butLoader")

    MapHelper.addButton( "butShare", "sharebutton", function() {
      MapHelper.toggle("butLoader", "butShare", "butCopied")
      map.emit('sharelink')
    })

    if ( TDHelpers.isLocalhost() ) {
      MapHelper.addButton( "butExit", "exitbutton", function() {
        map.emit('keyframe')
      })
      MapHelper.addButton( "butMute", "mutebutton", function() {
        scene.debugLayer.show({ embedMode: true });
      })
    }

    MapHelper.addButton( "butPlay", "playbutton", function() {
      if ( $('#modeltitle').length > 0 ) { return; }
      MapHelper.toggle("butPause","butPlay")
      MapAnimation.play()
    })

    MapHelper.addButton( "butPause", "playbutton", function() {
      MapHelper.toggle("butPlay","butPause")
      MapAnimation.pause()
    })

    MapHelper.hide("butPause")

    MapHelper.addButton( "butInfo", "infobutton", function() {
      var textbox = MapHelper.showInfoText(function(){
        $(textbox).fadeOut(400, function(){
          $(textbox).remove()
        })
      });
      $(textbox).fadeIn(300);
    })
    MapHelper.hide("butInfo")

    if ( shareData != undefined ) {
      setTimeout( function() {
        if ( MapAnimation.moveToShareData(shareData) ) {
          MapHelper.toggle("butPause","butPlay")
        }
      }, 1000)
    } else {
      setTimeout(function() {
        MapAnimation.start()
      }, 1500)
    }

    map.on('pointerdown', e => {
      MapAnimation.pause()
      MapHelper.toggle("butNav", "butLoader1")
    });

    map.on('pointerup', e => {
      if ( $('#modeltitle').length > 0 ) { return; }

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
