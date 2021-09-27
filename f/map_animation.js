var MapAnimation = {
  keyFrames: [
    {
      zoom: 17,
      position_latitude: 52.516166840778006,
      position_longitude: 13.396783543808155,
      tilt: 45,
      rotation: 39
    },
    {
      zoom: 15,
      position_latitude: 52.51735256666293,
      position_longitude: 13.40270391474741,
      tilt: 7.806629834254122,
      rotation: 27.25,
    },
    { zoom: 18, position_latitude: 52.519289001787435, position_longitude: 13.403460483846198, tilt: 7.806629834254122, rotation: 27.25 },
    { zoom: 17.200000000000003, position_latitude: 52.521517105528694, position_longitude: 13.39883145381916, tilt: 7.806629834254122, rotation: 27.25 },
    { zoom: 18, position_latitude: 52.521637310310844, position_longitude: 13.39497869418961, tilt: 28.641685642439327, rotation: -60.75 },
    { zoom: 16.800000000000004, position_latitude: 52.52368951134793, position_longitude: 13.398386724632212, tilt: 28.641685642439327, rotation: -60.75 },
    { zoom: 18, position_latitude: 52.52150767776788, position_longitude: 13.40411117220343, tilt: 6.318411562240897, rotation: -52.75 },
    { zoom: 17.000000000000004, position_latitude: 52.528016423678196, position_longitude: 13.39863037896105, tilt: 6.318411562240897, rotation: -52.75 },
    { zoom: 18, position_latitude: 52.52839568401823, position_longitude: 13.399537987437013, tilt: 10.931888205481906, rotation: 54.5 },
    { zoom: 18, position_latitude: 52.53103205358212, position_longitude: 13.406992728519743, tilt: 21.20059428237318, rotation: 105.5 },

    { zoom: 18, position_latitude: 52.5332323775939, position_longitude: 13.414526919147269, tilt: 32.808696804076355, rotation: 40.5 },

    { zoom: 16.400000000000006, position_latitude: 52.53162789907494, position_longitude: 13.413873824814674, tilt: 21.20059428237318, rotation: 105.5 },
    { zoom: 15.600000000000009, position_latitude: 52.53397597451004, position_longitude: 13.415555025113262, tilt: 8.550738970260735, rotation: 280.75 },
    { zoom: 17.200000000000003, position_latitude: 52.53397597451004, position_longitude: 13.415555025113262, tilt: 42.333293744961004, rotation: 18.5 },
    { zoom: 16.400000000000006, position_latitude: 52.53886332986745, position_longitude: 13.418768330770307, tilt: 35.487489693700155, rotation: 20.75 },
    { zoom: 18, position_latitude: 52.53068307834979, position_longitude: 13.4125088039727, tilt: 33.70162776728429, rotation: -13 },
    { zoom: 16.400000000000006, position_latitude: 52.53976478141401, position_longitude: 13.381687845471696, tilt: 4.830193290227658, rotation: 102.5 },
     { zoom: 18, position_latitude: 52.53855831961797, position_longitude: 13.379763238095864, tilt: 13.461859267904384, rotation: 113 }
  ],

  animState: {
  },

  currKeyFrame: 0,
  currAnim: null,

  animUpdateCallback: function() {
    map.setTilt( MapAnimation.animState.tilt )
    map.setRotation( MapAnimation.animState.rotation )
    map.setPosition( {
      latitude:  MapAnimation.animState.position_latitude,
      longitude: MapAnimation.animState.position_longitude
    })
    map.setZoom( MapAnimation.animState.zoom )
  },

  nextFrame: function(frameNr) {
    MapAnimation.currAnim = anime({
      targets:  MapAnimation.animState,
      easing:   'easeInCubic',
      duration: 3000,
      update:   MapAnimation.animUpdateCallback,
      complete: function (anim) {
        setTimeout(function() {
          MapAnimation.nextKeyFrame()
        }, 1000 );
      }, ...MapAnimation.keyFrames[frameNr]
    })
  },

  nextKeyFrame: function() {
    MapAnimation.currKeyFrame += 1

    if ( MapAnimation.keyFrames[MapAnimation.currKeyFrame] == undefined ) {
      console.log("animation complet")
      return;
    } else {
      console.log( "Frame #: " + MapAnimation.currKeyFrame )
      console.log( MapAnimation.keyFrames[MapAnimation.currKeyFrame] )
    }

    MapAnimation.nextFrame(MapAnimation.currKeyFrame)
  },

  stop: function() {
    MapAnimation.currAnim.pause()
  },
  pause: function() {
    MapAnimation.currAnim.pause()
  },
  play: function() {
    MapAnimation.currAnim.play()
  },

  start: function(fromFrame = 0) {
    MapAnimation.currKeyFrame = fromFrame;
    MapAnimation.animState = {
      ...MapAnimation.keyFrames[MapAnimation.currKeyFrame]
    }
    MapAnimation.nextFrame(MapAnimation.currKeyFrame+1)
  },

};
