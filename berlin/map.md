---
title: 3D Tour
permalink: /berlin/map
layout: none
---

<link href="/f/OSMBuildings.css" rel="stylesheet">
<script src="/f/OSMBuildings.js"></script>
<script src="/f/bjs/jquery.js"></script>
<script src="/f/bowser.js"></script>

<div id="map" style="height: 100%; width: 100%"></div>

  <script>
  var browser = bowser.getParser(window.navigator.userAgent);

  var map = new OSMBuildings({
     container: 'map',
     position: { latitude: 52.51836, longitude: 13.40438 },
     zoom: 16,
     minZoom: 15,
     maxZoom: 30,
     tilt: 30,
     attribution: '© Data <a href="https://openstreetmap.org/copyright/">OpenStreetMap</a> © Map <a href="https://mapbox.com/">Mapbox</a> © 3D <a href="https://osmbuildings.org/copyright/">OSM Buildings</a>'

  })

  map.addMapTiles('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png');

  if ( browser.getPlatformType() !== "mobile" ) {
    map.addGeoJSONTiles('https://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json');
  }


  var haveObjs = [
    {
      mlid: "0ec35096975442188f5278665013bfae",
      loc: [52.56928,13.44615],
      rotation: 60,
    },
    {
      mlid: "3d0f151bf808494a9eb1b2a81665e832",
      loc: [52.52605,13.42966],
      rotation: 60,
    },
    {
      mlid: "70fcd5892cb346429c04c1d852b96169",
      loc: [52.53858,13.42697],
      rotation: 60,
    },
    {
      mlid: "924b850d72bd46478ab650cfa353d94d-1",
      loc: [52.52830,13.39892],
      rotation: 60,
    },
    {
      mlid: "924b850d72bd46478ab650cfa353d94d-2",
      loc: [52.52802,13.39907],
      rotation: 60,
    },
    {
      mlid: "924b850d72bd46478ab650cfa353d94d-3",
      loc: [52.52819,13.39915],
      rotation: 60,
    },
  ]
  $.each( haveObjs, function(idx, obj) {
    map.addOBJ( `${location.protocol}//${location.hostname}:${location.port}/m/${obj.mlid}/lods.obj`, { latitude: obj.loc[0], longitude: obj.loc[1] }, { scale: 25, altitude: 10, color: 'red', id: 'up-' + obj.mlid, rotation: obj.rotation });
  })

  map.on('pointerup', e => {
    $.each( e.features || [], function(idx,obj) {
      if ( obj.id.substring(0,3) === "up-" ) {
        var data = { o: obj.id.substring(3) }

        var url = new URL(window.location)
        var shareUrl = url.origin + "/berlin/3dtour#" + window.btoa(
          JSON.stringify(data));
        window.location = shareUrl;
      }
    })
  });

</script>
