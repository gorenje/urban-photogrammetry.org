---
title: Berlin Tour
---

{% capture idx %}{% include berlin_get_page_idx.html %}{% endcapture %}
{% assign idx = idx | abs %}
{% assign data = site.data.berlin[idx] %}

{% include berlin_title.html title=data.title %}

{% include model.html mlid=data.mlid %}

Street art by [Lucuna](http://lacuna.blogsport.eu/)

{% include location.html loc=data.loc %}

{% include berlin_nav.html %}
