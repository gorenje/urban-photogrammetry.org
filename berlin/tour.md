---
title: 3D Tour
permalink: /berlin/tour
layout: 3dtour
---

<!--
 <a href='#' id="firstbutton">First</a>
  <a href='#' id="startbutton">Start</a>
  -->

<script src="/f/three.min.js"></script>

<script type="module">

import { GLTFLoader } from '/f/GLTFLoader.js';
import { OrbitControls, MapControls } from '/f/OrbitControls.js';
import { TWEEN } from '/f/tween.module.min.js'

var animateThisScene = true;

function loadFirst() {
  loader.load( '/m/first.glb', function ( gltf ) {

    console.log(gltf)

    scene.add( gltf.scene)
    camera.far = gltf.scene.position.length()

    console.log(gltf)
    // new TWEEN.Tween( camera.position ).to( {
    //   x: gltf.scene.position.x,
    //   y: gltf.scene.position.y,
    //   z: gltf.scene.position.z
    // }, 5000).easing(TWEEN.Easing.Cubic.Out).start().onComplete(function(){
    //   camera.lookAt( gltf.scene )
    // })

    new TWEEN.Tween( gltf.scene.scale ).to( {
      x: 3,
      y: 3,
      z: 3
    }, 5000).easing(TWEEN.Easing.Cubic.Out).start().onComplete(function(){
      camera.lookAt( gltf.scene.position )
      // camera.updateProjectionMatrix();
      console.log(scene.children[0].children[0])
    })

  })

  return false;
}
function startAnim() {
  animateThisScene = true;
  return false;
}


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}


const scene = new THREE.Scene();

var camera = null;
var controls = null;
var mixer = null;
var actions = null;
var clock = new THREE.Clock();

const renderer = new THREE.WebGLRenderer();
const container = document.getElementById('3dcontainer')
const loader = new GLTFLoader();

document.body.appendChild( renderer.domElement );

  const animate = function () {

	  const dt = clock.getDelta();

	  if ( mixer && animateThisScene ) mixer.update( dt );
    TWEEN.update()
    if ( controls )  controls.update();
	  requestAnimationFrame( animate );

	  renderer.render( scene, camera );
  };

window.addEventListener('load', function() {
  document.getElementById('firstbutton').onclick = loadFirst;
  document.getElementById('startbutton').onclick = startAnim;
})

window.addEventListener( 'resize', onWindowResize );


loader.load( '/m/universe-with-animation-and-cameras.glb', function ( gltf ) {

  scene.add( gltf.scene)

  mixer = new THREE.AnimationMixer( gltf.scene );

  actions = {}
  for ( let i = 0; i < gltf.animations.length; i ++ ) {
		const clip = gltf.animations[ i ];
		const action = mixer.clipAction( clip );
		actions[ clip.name ] = action;
    console.log(clip)
    action.play()
	}

  camera = gltf.cameras[0];

  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.localClippingEnabled = false;
  renderer.physicallyCorrectLights = true;


  container.appendChild( renderer.domElement );
  //controls = new OrbitControls( camera, renderer.domElement );
  //controls.enableDamping = true

  animate();

}, undefined, function ( error ) {
	console.error( error );
});




</script>
