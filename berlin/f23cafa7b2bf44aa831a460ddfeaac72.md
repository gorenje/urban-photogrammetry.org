---
title: Berlin Tour
---

{% capture idx %}{% include berlin_get_page_idx.html %}{% endcapture %}
{% assign idx = idx | abs %}
{% assign data = site.data.berlin[idx] %}

{% include berlin_title.html title=data.title %}

{% include model.html mlid=data.mlid %}


## Slightly Polished

{% include model.html mlid="d6c4a9e302e44f71a31cf87eea9020ae" %}

[Wikipedia](https://en.wikipedia.org/wiki/Ernst_Th%C3%A4lmann)

{% include location.html loc=data.loc %}

{% include berlin_nav.html %}
