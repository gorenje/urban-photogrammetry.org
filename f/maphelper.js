var MapHelper = {

  createStreetMap: function() {
    var browser = bowser.getParser(window.navigator.userAgent);

    $('#loadingScreen').hide()
    $('#3dcanvas').hide()

    map = new OSMBuildings({
      container: 'map',
      position: { longitude: 13.402637132184573, latitude: 52.51795169799803 },
      zoom: 17,
      minZoom: 1,
      rotation: 39,
      maxZoom: 30,
      tilt: 38.355,
      attribution: '© Data <a href="https://openstreetmap.org/copyright/">OpenStreetMap</a> © Map <a href="https://mapbox.com/">Mapbox</a> © 3D <a href="https://osmbuildings.org/copyright/">OSM Buildings</a>'
    })

    // map.addMapTiles('https://{s}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v8/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidXJiYW4tcGhvdG9ncmFtbWV0cnkiLCJhIjoiY2tzd3lrM3M4MDdqajJ1cDJobXlqY2Z1YiJ9.xgtMCLrDbaQn8Kyb1zqAwA&style=cksx0f5e04xkn18o7zt5sincf');
    map.addMapTiles('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    //map.addMapTiles('https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png');
    //map.addMapTiles('https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png');

    if ( browser.getPlatformType() !== "{ longitude: 13.40309, latitude: 52.51868 }mobile" ) {
      map.addGeoJSONTiles('https://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json');
    }

    var haveObjs = [
      {
        mlid: "2bae9bf38b8b4a8aa27921405db96e7f",
        loc: [52.54235,13.43003],
        rotation: 0,
        scale: 20,
      },
      {
        mlid: "849f0331d956447db09dd03460716ce7",
        loc: [52.51438,13.36843],
        rotation: 0,
        scale: 40,
      },
      {
        mlid: "04684a56cce44825b5912e57cd721121",
        loc: [52.51868,13.40336],
        rotation: 240,
        scale: 200,
      },
      {
        mlid: "f23cafa7b2bf44aa831a460ddfeaac72",
        loc: [52.53813,13.43378],
        rotation: -55,
        scale: 50,
      },
      {
        mlid: "e1199bf674984c5092cb46f04660297e",
        loc: [52.53856,13.37818],
        rotation: -110,
        scale: 20,
      },
      {
        mlid: "7c6471d3946d4dc0bbe99a1b492a3f01",
        loc: [52.53895,13.37879],
        rotation: 95,
        scale: 40,
        altitude: 10,
      },
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
        scale: 40,
        altitude: 10,
      },
      {
        mlid: "3d0f151bf808494a9eb1b2a81665e832",
        loc: [52.52596,13.43132],
        rotation: 60,
        scale: 50,
        altitude: 10,
      },
      {
        mlid: "3867f03ae07b43d29630e70b86f7abc9",
        loc: [52.52636,13.42896],
        rotation: 210,
        scale: 50,
        altitude: 10,
      },
    ]

    $.each( haveObjs, function(idx, obj) {
      setTimeout( function() {
      map.addOBJ( `${location.protocol}//${location.hostname}:${location.port}/m/${obj.mlid}/lods.obj`,
                  { latitude: obj.loc[0], longitude: obj.loc[1] },
                  { scale: obj.scale,
                    altitude: obj.altitude || 0,
                    color: 'purple',
                    id: 'up-' + obj.mlid,
                    rotation: obj.rotation
                  });
      }, 1000 * Math.random() )
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
