var MapHelper = {

  createStreetMap: function() {
    var browser = bowser.getParser(window.navigator.userAgent);

    $('#loadingScreen').hide()
    $('#3dcanvas').hide()

    map = new OSMBuildings({
      container: 'map',
      position: { longitude: 13.398496729891198, latitude: 52.52535612426755 },
      zoom: 17,
      minZoom: 1,
      maxZoom: 30,
      tilt: 39.495,
      attribution: '© Data <a href="https://openstreetmap.org/copyright/">OpenStreetMap</a> © Map <a href="https://mapbox.com/">Mapbox</a> © 3D <a href="https://osmbuildings.org/copyright/">OSM Buildings</a>'
    })

    // map.addMapTiles('https://{s}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v8/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidXJiYW4tcGhvdG9ncmFtbWV0cnkiLCJhIjoiY2tzd3lrM3M4MDdqajJ1cDJobXlqY2Z1YiJ9.xgtMCLrDbaQn8Kyb1zqAwA&style=cksx0f5e04xkn18o7zt5sincf');
    map.addMapTiles('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    //map.addMapTiles('https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png');
    //map.addMapTiles('https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png');

    if ( browser.getPlatformType() !== "mobile" ) {
      map.addGeoJSONTiles('https://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json');
    }

    var haveObjs = [
      {
        mlid: "7770af0084454d0ba0c98e5eca1661cc",
        loc: [52.52041,13.39808],
        rotation: -10,
        scale: 20,
      },
      {
        mlid: "2c37ef0e1b9043809514e10c59f82661",
        loc: [52.53190,13.41270],
        rotation: 30,
        scale: 20,
        altitude: 30,
      },
      {
        mlid: "70fcd5892cb346429c04c1d852b96169",
        loc: [52.53858,13.42697],
        rotation: 30,
        scale: 50,
      },
      {
        mlid: "924b850d72bd46478ab650cfa353d94d-1",
        loc: [52.52830,13.39892],
        rotation: 0,
        scale: 20,
        altitude: 40,
      },
      {
        mlid: "924b850d72bd46478ab650cfa353d94d-2",
        loc: [52.52802,13.39907],
        rotation: 60,
        scale: 30,
        altitude: 40,
      },
      {
        mlid: "924b850d72bd46478ab650cfa353d94d-3",
        loc: [52.52819,13.39915],
        rotation: 120,
        scale: 30,
        altitude: 40,
      },
      {
        mlid: "0ec35096975442188f5278665013bfae",
        loc: [52.56928,13.44615],
        rotation: -95,
        scale: 30,
      },
      {
        mlid: "3d0f151bf808494a9eb1b2a81665e832",
        loc: [52.52571,13.42987],
        rotation: 60,
        scale: 30,
      },
      {
        mlid: "3867f03ae07b43d29630e70b86f7abc9",
        loc: [52.52636,13.42896],
        rotation: 210,
        scale: 30,
      },
    ]

    $.each( haveObjs, function(idx, obj) {
      map.addOBJ( `${location.protocol}//${location.hostname}:${location.port}/m/${obj.mlid}/lods.obj`,
                  { latitude: obj.loc[0], longitude: obj.loc[1] },
                  { scale: obj.scale,
                    altitude: obj.altitude || 0,
                    color: 'purple',
                    id: 'up-' + obj.mlid,
                    rotation: obj.rotation
                  });
    })

    map.on('pointerup', e => {
      $.each( e.features || [], function(idx,obj) {
        if ( obj.id.substring(0,3) === "up-" ) {
          $('#3dcanvas').fadeIn(500, function() {
            if ( engine == null ) {
              displayModel(obj.id.substring(3))
            } else {
              clearScene(scene, skyboxMesh, alltextures)

              // restruction
              currModel      = UPModels.modelForMlid(obj.id.substring(3))
              var r          = createSkyBox(scene)
              skyboxMesh     = r[0]
              multimat       = r[1]
              textBlock.text = currModel.text;

              loadSkyBoxMaterial(currModel.mlid, baseMaterialSizes[0],
                                 alltextures, multimat,scene)
              addKeyboardObserver(scene, skyboxMesh);
              loadModel(currModel, scene, skyboxMesh, multimat, baseMaterialSizes)
            }
          })
          $('#map').fadeOut(500)
        }
      })
    });
  }
}
