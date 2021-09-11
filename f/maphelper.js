var MapHelper = {
  AvailableModels: [
    {
      mlid: "17ebfbf933e345dba395a4169dcbc7d5",
      loc: [52.52642,13.41144],
      rotation: 20,
      scale: 35,
    },
    {
      mlid: "dc42a16b3a7e4a7398ac9af1254d1d96",
      loc: [52.51845,13.36810],
      rotation: -90,
      scale: 18,
    },
    {
      mlid: "b582f8af0b934f4dbbf055c63d4e882e",
      loc: [52.51913,13.36894],
      rotation: 0,
      scale: 17,
    },
    {
      mlid: "1db1215c7d7d4d7b91b30ed3f8d47b40",
      loc: [52.52708,13.41407],
      rotation: 40,
      scale: 13,
    },
    {
      mlid: "8b6a3c122a0d455691436494cc3928aa",
      loc: [52.51683,13.35704],
      rotation: 180,
      scale: 15,
    },
    {
      mlid: "ee048169659a49dcbb410bf1e9ff84b8",
      loc: [52.53145,13.40613],
      rotation: 110,
      scale: 15,
    },
    {
      mlid: "8e9f528940e44226bc3f6ced6088dd44",
      loc: [52.57201,13.38596],
      rotation: 0,
      scale: 20,
    },
    {
      mlid: "45ce067400d248c6b232401054348bad",
      loc: [52.57091,13.39684],
      rotation: 270,
      scale: 10,
    },
    {
      mlid: "bb3207ff1bba4465bb331bd38054ffe5",
      loc: [52.50798,13.36619],
      rotation: 90,
      scale: 20,
    },
    {
      mlid: "6f198c61895f4cf8ac029db8998903a6",
      loc: [52.56957,13.39378],
      rotation: 0,
      scale: 50,
    },
    {
      mlid: "5d7de3d158cf48a2bb1852f6a6b231ac",
      loc: [52.49958,13.39201],
      rotation: 85,
      scale: 50,
    },
    {
      mlid: "46af2175f9ee432989d7a0d485ea8302",
      loc: [52.53769,13.37787],
      rotation: 110,
      scale: 30,
    },
    {
      mlid: "4aa3f73788464b299ef755cac03f0ca6",
      loc: [52.49724,13.41643],
      rotation: 110,
      scale: 90,
    },
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
  ],

  createStreetMap: function() {
    var browser = bowser.getParser(window.navigator.userAgent);

    $('#loadingScreen').hide()
    $('#3dcanvas').hide()

    var loc = { longitude: MapHelper.AvailableModels[0].loc[1],
                latitude: MapHelper.AvailableModels[0].loc[0] }

    map = new OSMBuildings({
      container: 'map',
      position: loc,
      zoom: 17,
      minZoom: 1,
      rotation: 39,
      maxZoom: 30,
      tilt: 38.355,
      attribution: '© Map & Data <a href="https://openstreetmap.org/copyright/">OpenStreetMap</a>© 3D <a href="https://osmbuildings.org/copyright/">OSM Buildings</a>'
    })

    map.addMapTiles('https://tile.openstreetmap.org/{z}/{x}/{y}.png');

    /* No 3d Buildings - make things too confusing.
     * if ( browser.getPlatformType() !== "mobile" ) {
     *   map.addGeoJSONTiles('https://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json');
     * }
     */
    $.each( MapHelper.AvailableModels, function(idx, obj) {
      setTimeout( function() {
        try {
          map.addOBJ( `${location.protocol}//${location.hostname}:${location.port}/m/${obj.mlid}/lods.obj`,
                    { latitude: obj.loc[0], longitude: obj.loc[1] },
                    { scale: obj.scale,
                      altitude: obj.altitude || 0,
                      color: 'white',
                      id: 'up-' + obj.mlid,
                      rotation: obj.rotation
                    });
        } catch (e ) { console.log(e) }
      }, Math.ceil(1000 * Math.random()) + 10);
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
