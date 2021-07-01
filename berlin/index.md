---
title: Berlin Tour
permalink: /berlin
---

# Three-dimensional virtual tour of Berlin

<link rel="stylesheet" href="/f/leaflet.css"/>
<script src="/f/leaflet.js"></script>

<style>
.leaflet-popup-content {
    width: 510px !important;
    height: 440px;
}
</style>

<script>
  var map;
  function init(){
    map = L.map('map').setView([52.5221, 13.4071], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

  }
  window.addEventListener("load", init);
</script>

<div id="map" class="map map-home" style="height: 600px; margin-top: 50px"></div>

So far, the following make up the tour:

{%- assign cnt = 0 %}
{%- for site in site.data.berlin %}
  - [{{site.idx | default: site.title}}](/berlin/{{ cnt }})
  {%- assign cnt = cnt | plus: 1 %}
{%- endfor %}

{%- assign cnt = 0 %}
{%- for site in site.data.berlin %}
  {%- if site.loc and site.loc != "" %}
    {%- include marker.html loc=site.loc mlid=site.mlid cnt=cnt %}
  {%- endif %}
  {%- assign cnt = cnt | plus: 1 %}
{%- endfor %}

The [collection](https://sketchfab.com/gorenje23/collections/urban-photogrammetry) is available at [SketchFab](https://sketchfab.com).

## Similar Projects

- [Niederösterreich 3D](https://www.noe-3d.at/)
- [City Museum Berlin](https://sketchfab.com/stadtmuseumBLN)
