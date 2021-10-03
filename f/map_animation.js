var MapAnimation = {
  emptyAnim: {
    pause: function(){},
    play: function(){}
  },

  ViewModelFrame: {
    examine: "Current Model"
  }
};

MapAnimation = {...MapAnimation, ...{
  keyFrames: [
    {"zoom":17,"position_latitude":52.51617,"position_longitude":13.39676,"tilt":42,"rotation":39},
    {"zoom":17,"position_latitude":52.51697709428457,"position_longitude":13.398000502390245,"tilt":16.394759087066838,"rotation":9.682318415260493},
    {"zoom":17.9312481536,"position_latitude":52.516605341692376,"position_longitude":13.397216128811124,"tilt":0,"rotation":13.3936508358626},
    MapAnimation.ViewModelFrame, // schucnk

    {"zoom":18,"position_latitude":52.51878925498369,"position_longitude":13.403132600849403,"tilt":0,"rotation":21.07874035255887},
    {"zoom":18,"position_latitude":52.51849411964798,"position_longitude":13.402997969815498,"tilt":0,"rotation":207.87095586241188},
    MapAnimation.ViewModelFrame, // engels

    {"zoom":17.6,"position_latitude":52.52036192322607,"position_longitude":13.397809574273278,"tilt":19.133558748943454,"rotation":206.1900220102718},
    {"zoom":18,"position_latitude":52.52022386246821,"position_longitude":13.397989555149719,"tilt":19.133558748943454,"rotation":206.1900220102718},
    {"zoom":18,"position_latitude":52.5198847469784,"position_longitude":13.397286788602456,"tilt":0,"rotation":220.78886118601991},
    MapAnimation.ViewModelFrame, // amazonia

    {"zoom":16.000000000000007,"position_latitude":52.52159014784615,"position_longitude":13.396502498372456,"tilt":19.133558748943454,"rotation":206.1900220102718},
    {"zoom":18,"position_latitude":52.52783253339743,"position_longitude":13.39858662276589,"tilt":19.133558748943454,"rotation":206.1900220102718},
    {"zoom":17.75550303378801,"position_latitude":52.52865823341268,"position_longitude":13.399404343193277,"tilt":0,"rotation":43.41959399470783},
    MapAnimation.ViewModelFrame, // clowns

    {"zoom":15.600000000000009,"position_latitude":52.517071135122045,"position_longitude":13.367763211560106,"tilt":19.133558748943454,"rotation":206.1900220102718},
    {"zoom":18,"position_latitude":52.51960630652334,"position_longitude":13.368986561298458,"tilt":19.133558748943454,"rotation":206.1900220102718},
    {"zoom":18,"position_latitude":52.51872502573343,"position_longitude":13.368824820485363,"tilt":0,"rotation":206.7503332943185},
    MapAnimation.ViewModelFrame, // rotersandstein

    {"zoom":18,"position_latitude":52.51397646799167,"position_longitude":13.368792958212051,"tilt":19.133558748943454,"rotation":206.1900220102718},
    {"zoom":18,"position_latitude":52.513981643959696,"position_longitude":13.368361769217168,"tilt":0,"rotation":206.1900220102718},
    {"zoom":18,"position_latitude":52.51467244254556,"position_longitude":13.367463489551078,"tilt":2.1497608258290235,"rotation":303.96359728535145},
    MapAnimation.ViewModelFrame, // hirsch

    {"zoom":18,"position_latitude":52.507666572855214,"position_longitude":13.365848697600084,"tilt":12.590870667793833,"rotation":205.13352898019113},
    {"zoom":18,"position_latitude":52.507641436922064,"position_longitude":13.366040262203605,"tilt":0,"rotation":206.18984042065549},
    MapAnimation.ViewModelFrame, // janus 2

    {"zoom":18,"position_latitude":52.507567666135095,"position_longitude":13.362337183393484,"tilt":12.590870667793833,"rotation":205.13352898019113},
    {"zoom":15.600000000000009,"position_latitude":52.507567666135095,"position_longitude":13.362337183393484,"tilt":12.590870667793833,"rotation":205.13352898019113},
    {"zoom":15.600000000000009,"position_latitude":52.54046778346811,"position_longitude":13.378807178013023,"tilt":12.590870667793833,"rotation":205.13352898019113},
    {"zoom":18,"position_latitude":52.53775770525703,"position_longitude":13.377584785752653,"tilt":12.590870667793833,"rotation":205.13352898019113},
    {"zoom":18,"position_latitude":52.53854603161615,"position_longitude":13.3786339448949,"tilt":0,"rotation":166.47205038096948},
    MapAnimation.ViewModelFrame, // engel - friedhof

    {"zoom":18,"position_latitude":52.53829474754796,"position_longitude":13.37836500057179,"tilt":16.851225697379626,"rotation":126.95304475421891},
    {"zoom":16.400000000000006,"position_latitude":52.53742584505776,"position_longitude":13.391551545400642,"tilt":16.851225697379626,"rotation":126.95304475421891},
    {"zoom":16.400000000000006,"position_latitude":52.53132049445016,"position_longitude":13.413052585610954,"tilt":16.851225697379626,"rotation":126.95304475421891},
    {"zoom":18,"position_latitude":52.5313501316639,"position_longitude":13.413669603850906,"tilt":16.851225697379626,"rotation":126.95304475421891},
    {"zoom":18,"position_latitude":52.532975580572845,"position_longitude":13.413062209249548,"tilt":21.72020287404909,"rotation":21.039618488628218},
    {"zoom":18,"position_latitude":52.53212419902776,"position_longitude":13.412687859562643,"tilt":0,"rotation":32.51728351000222},
    MapAnimation.ViewModelFrame, // senefelder

    {"zoom":16.400000000000006,"position_latitude":52.5246759471983,"position_longitude":13.411054784728822,"tilt":21.72020287404909,"rotation":21.039618488628218},
    {"zoom":18,"position_latitude":52.526790765120225,"position_longitude":13.411860072035836,"tilt":8.634826711749868,"rotation":20.24724871606769},
    {"zoom":18,"position_latitude":52.52713531578863,"position_longitude":13.413925584751011,"tilt":0,"rotation":-41.94730381311514},
    MapAnimation.ViewModelFrame, // rosa luxemburg

    {"zoom":18,"position_latitude":52.52926587817333,"position_longitude":13.421420370349058,"tilt":8.634826711749868,"rotation":20.24724871606769},
    {"zoom":18,"position_latitude":52.52925248345829,"position_longitude":13.421054293694445,"tilt":27.19780219780224,"rotation":-182.59941305942772},
    {"zoom":16.400000000000006,"position_latitude":52.52790781433654,"position_longitude":13.430399974921865,"tilt":27.19780219780224,"rotation":-182.59941305942772},
    {"zoom":17.400000000000002,"position_latitude":52.52584770108563,"position_longitude":13.430422834955356,"tilt":27.19780219780224,"rotation":-182.59941305942772},
    {"zoom":17.400000000000002,"position_latitude":52.52607693487538,"position_longitude":13.429835319271255,"tilt":42,"rotation":-331.4583087649501},
    {"zoom":17.400000000000002,"position_latitude":52.525813725479736,"position_longitude":13.431416525259271,"tilt":0,"rotation":-318.57114923187595},
    MapAnimation.ViewModelFrame, // spainische krieger denkmal

    {"zoom":16.400000000000006,"position_latitude":52.53383128658737,"position_longitude":13.431433225126248,"tilt":42,"rotation":-344.70984250728117},
    {"zoom":17.200000000000003,"position_latitude":52.53939469766116,"position_longitude":13.43410633924266,"tilt":42,"rotation":-344.70984250728117},
    {"zoom":18,"position_latitude":52.53833114096901,"position_longitude":13.432969770476225,"tilt":42,"rotation":-54.501253550226295},
    {"zoom":18,"position_latitude":52.5381851436698,"position_longitude":13.43343240926975,"tilt":0,"rotation":-57.30280997045976},
    MapAnimation.ViewModelFrame, // ernst thaelmann

    {"zoom":17.6,"position_latitude":52.53862645142186,"position_longitude":13.426624640446189,"tilt":43.96253602305475,"rotation":17.940464241184763},
    {"zoom":18,"position_latitude":52.54050572752514,"position_longitude":13.428048775594958,"tilt":41.96253602305475,"rotation":17.940464241184763},
    {"zoom":15.800000000000008,"position_latitude":52.56913380160043,"position_longitude":13.444883040641702,"tilt":41.96253602305475,"rotation":17.940464241184763},
    {"zoom":18,"position_latitude":52.57024470438567,"position_longitude":13.446422278491994,"tilt":41.96253602305475,"rotation":17.940464241184763},
    {"zoom":18,"position_latitude":52.56900237887969,"position_longitude":13.445535257467034,"tilt":22.521613832852978,"rotation":-110.5994130594287},
    {"zoom":18,"position_latitude":52.569218516339504,"position_longitude":13.445453494706767,"tilt":0,"rotation":-109.75894613335865},
    MapAnimation.ViewModelFrame, // buddhist temple

    {"zoom":15,"position_latitude":52.56900237887969,"position_longitude":13.445535257467034,"tilt":22.521613832852978,"rotation":-110.5994130594287},
    {"zoom":15,"position_latitude":52.569144317413404,"position_longitude":13.39350647446221,"tilt":22.521613832852978,"rotation":-110.5994130594287},
    {"zoom":17.59999999999999,"position_latitude":52.56981876935501,"position_longitude":13.393942801841346,"tilt":22.521613832852978,"rotation":-110.5994130594287},
    {"zoom":18,"position_latitude":52.5694284239636,"position_longitude":13.39381900396173,"tilt":0,"rotation":30.318874878314517},
    MapAnimation.ViewModelFrame, // pankow buerger park

    {"zoom":15.999999999999996,"position_latitude":52.56981876935501,"position_longitude":13.393942801841346,"tilt":22.521613832852978,"rotation":-110.5994130594287},
    {"zoom":17.59999999999999,"position_latitude":52.57168891211305,"position_longitude":13.386199568519876,"tilt":22.521613832852978,"rotation":-110.5994130594287},
    {"zoom":15,"position_latitude":52.569444571635636,"position_longitude":13.375270426633922,"tilt":42,"rotation":-202.47671367292543},
    {"zoom":15,"position_latitude":52.56133415453316,"position_longitude":13.314320718016232,"tilt":42,"rotation":-272.7098425072809},
    {"zoom":15,"position_latitude":52.52689912600376,"position_longitude":13.29552629309822,"tilt":42,"rotation":-272.7098425072809},
    {"zoom":15,"position_latitude":52.50827405347126,"position_longitude":13.279230307661816,"tilt":42,"rotation":-272.7098425072809},
    {"zoom":18,"position_latitude":52.507198628666764,"position_longitude":13.286118650911469,"tilt":21.82997118155617,"rotation":-275.36014925574733},
    {"zoom":18,"position_latitude":52.50722677642856,"position_longitude":13.2865878032603,"tilt":0,"rotation":-273.6792154036072},
    MapAnimation.ViewModelFrame, // seals in charlottenburg

    {"zoom":15,"position_latitude":52.51833524264239,"position_longitude":13.31574435842597,"tilt":0,"rotation":-273.6792154036072},
    {"zoom":15,"position_latitude":52.527901512777596,"position_longitude":13.368676578254043,"tilt":0,"rotation":-273.6792154036072},
    {"zoom":15,"position_latitude":52.53138907312063,"position_longitude":13.408081278042259,"tilt":0,"rotation":-273.6792154036072},
    {"zoom":18,"position_latitude":52.53188950618247,"position_longitude":13.41003329415108,"tilt":0,"rotation":-273.6792154036072},
    {"zoom":18,"position_latitude":52.532016468090646,"position_longitude":13.409288535832369,"tilt":0,"rotation":-145.08777571489125},
    MapAnimation.ViewModelFrame, // froschkoenig
  ],

  animState: {
  },

  currKeyFrame: 0,
  currAnim: MapAnimation.emptyAnim,
  currTimeout: null,

  stateFromCamera: function() {
    MapAnimation.animState = {
      tilt:               map.getTilt(),
      rotation:           map.getRotation(),
      position_latitude:  map.getPosition().latitude,
      position_longitude: map.getPosition().longitude,
      zoom:               map.getZoom()
    }
  },

  animUpdateCallback: function() {
    map.setTilt( MapAnimation.animState.tilt )
    map.setRotation( MapAnimation.animState.rotation )
    map.setPosition( {
      latitude:  MapAnimation.animState.position_latitude,
      longitude: MapAnimation.animState.position_longitude
    })
    map.setZoom( MapAnimation.animState.zoom )
  },

  animCompleteCallback: function(anim) {
    MapAnimation.currAnim = MapAnimation.emptyAnim

    MapAnimation.currTimeout = setTimeout(function() {
      MapAnimation.nextKeyFrame()
    }, 1000 );
  },

  moveToFrame: function(frameNr) {
    MapAnimation.currAnim = anime({
      targets:  MapAnimation.animState,
      easing:   'easeInCubic',
      duration: 1500,
      update:   MapAnimation.animUpdateCallback,
      complete: MapAnimation.animCompleteCallback,
      ...MapAnimation.keyFrames[frameNr]
    })
  },

  nextKeyFrame: function() {
    MapAnimation.currKeyFrame += 1

    if ( MapAnimation.keyFrames[MapAnimation.currKeyFrame] == undefined ) {
      return;
    }

    if (MapAnimation.keyFrames[MapAnimation.currKeyFrame] == MapAnimation.ViewModelFrame){
      MapAnimation.currKeyFrame += 1
      MapHelper.examineModel( MapHelper.currentVisibleModels()[0].mlid )
      setTimeout(ButtonHelpers.CB.flythrough, 1000)
    } else {
      console.log( "Next frame: " + MapAnimation.currKeyFrame)
      console.log( MapAnimation.keyFrames[MapAnimation.currKeyFrame] )
      MapAnimation.moveToFrame(MapAnimation.currKeyFrame)
    }
  },

  stop: function() {
    clearTimeout( MapAnimation.currTimeout )
    MapAnimation.currAnim.pause()
    MapAnimation.currKeyFrame = 0;
  },

  pause: function() {
    clearTimeout( MapAnimation.currTimeout )
    MapAnimation.currAnim.pause()
  },

  play: function() {
    MapAnimation.stateFromCamera()
    MapAnimation.moveToFrame(MapAnimation.currKeyFrame)
  },

  start: function(fromFrame = 0) {
    MapAnimation.currKeyFrame = fromFrame;
    MapAnimation.animState = {
      ...MapAnimation.keyFrames[MapAnimation.currKeyFrame]
    }

    MapAnimation.currKeyFrame += 1
    MapAnimation.moveToFrame(MapAnimation.currKeyFrame)
  },

}};
