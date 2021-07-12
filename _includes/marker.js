{%- assign mlat = include.mlat | default: include.loc | split: "," | first %}
{%- assign mlon = include.mlon | default: include.loc | split: "," | last %}

<script>
function onload{{include.cnt}}(){
  var cntr  = document.createElement("div")

  var frme = document.createElement('iframe')

  frme.height = "210"
  frme.width = "300"
  frme.frameborder="0"
  frme.allowfullscreen = "allowfullscreen"
  frme.mozallowfullscreen="true"
  frme.webkitallowfullscreen="true"
  frme.allow="fullscreen; autoplay; vr"
  frme.src="https://sketchfab.com/models/{{ include.mlid }}/embed?autostart=1&annotations_visible=0&sound=0&autoplay=0"
  cntr.append(frme)
  cntr.append(document.createElement("p"))

  var lnk = document.createElement("a")
  lnk.href = "/berlin/{{ include.mlid }}"
  lnk.target = "_blank"

  var lnktxt = document.createTextNode("{{ include.title }}")
  lnk.appendChild(lnktxt)
  cntr.append(lnk)

  var mrkr = L.marker([{{ mlat }}, {{ mlon }}]);
  mrkr.addTo(map).bindPopup(cntr);
}

window.addEventListener("load", onload{{include.cnt}});
</script>
