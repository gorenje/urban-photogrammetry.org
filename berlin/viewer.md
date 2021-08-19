---
title: 3D Tour
permalink: /berlin/viewer
layout: 3dtour
---

<script src="/f/bjs/babylon.viewer.js"></script>

<babylon model="/m/universe-with-animation-and-cameras.glb"
         animation.auto-start="true"
         skybox="true"
         camera.behaviors.auto-rotate="0"
         camera.behaviors.bouncing.type="0"
         camera.behaviors.framing.type="0"
         camera.behaviors.framing.zoomOnBoundingInfo="false"
         camera.behaviors.framing.zoomStopsAnimation="false"
></babylon>
