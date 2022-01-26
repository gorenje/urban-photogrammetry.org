---
title: Berlin Tour
permalink: /berlin
---

# Berlin Virtual Tour

Presenting a three dimensional virtual tour of Berlin! The tour is made up of
interesting urban objects in and around Berlin. There is neither rhyme nor
reason to the tour, it is simply an active documentation of Berlins urban space.

<link rel="stylesheet" href="/f/leaflet.css"/>
<script src="/f/leaflet.js"></script>

<style>
#map img.leaflet-tile {
  filter: grayscale(1);
  -webkit-filter: grayscale(1);
}
#map canvas {
  cursor: pointer;
  opacity: 0.85;
}

.leaflet-popup-content {
    width: 350px !important;
    height: 300px;
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


Currently the tour is made up of the following 3D models:

<div id="map" class="map map-home" style="height: 600px; margin-top: 50px"></div>

{%- assign cnt = 0 %}
<ul>
{%- assign sortedcollection = site.data.berlin | sort: "title" %}
{%- for site in sortedcollection %}
  <li>
  <a href="/berlin/{{ site["mlid"] }}">{{site.idx | default: site.title}}</a>
  {%- if site.tourlink %}
    <!-- <a target=_blank href='{{ site.tourlink }}'>(Berlin 3D Tour)</a> -->
  {%- endif %}
  </li>
  {%- if site.loc and site.loc != "" %}
    {%- include marker.js loc=site.loc mlid=site.mlid cnt=cnt title=site.title %}
  {%- endif %}
  {%- assign cnt = cnt | plus: 1 %}
{%- endfor %}
</ul>


The complete [collection](https://sketchfab.com/urban.photogrammetry/collections/urban-photogrammetry-berlin) is available at [SketchFab](https://sketchfab.com).

## External Models

These are models that are not available on SketchFab.

{%- assign cnt = 0 %}
<ul>
{%- for site in site.data.berlin_external %}
  <li><a href="{{ site.link }}">{{ site.idx }}</a></li>
  {%- if site.loc and site.loc != "" %}
    {%- include marker_external.js site=site cnt=cnt %}
  {%- endif %}
  {%- assign cnt = cnt | plus: 1 %}
{%- endfor %}
</ul>

## Similar Projects

- [Niederösterreich 3D](https://www.noe-3d.at/)
- [City Museum Berlin](https://sketchfab.com/stadtmuseumBLN)
