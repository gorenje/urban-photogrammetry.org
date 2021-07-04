{%- assign mlat = include.mlat | default: include.site.loc | split: "," | first %}
{%- assign mlon = include.mlon | default: include.site.loc | split: "," | last %}

<script>
  function onload_external{{include.cnt}}(){
    var elem = document.createElement('a')

    elem.href = "{{ include.site.link }}"
    elem.appendChild(document.createTextNode("{{ include.site.title }}"));

    var greenIcon = new L.Icon({
      iconUrl: '/f/images/leaflet-color-markers/marker-icon-2x-green.png',
      shadowUrl: '/f/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });


    var mrkr = L.marker([{{ mlat }}, {{ mlon }}], {icon: greenIcon});
    mrkr.addTo(map).bindPopup(elem, { maxWidth: 100, maxHeight: 100 } );
  }

  window.addEventListener( "load", onload_external{{include.cnt}} );
</script>
