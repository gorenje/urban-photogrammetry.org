---
layout: none
---
var ModelNames = {
{%- for site in site.data.berlin %}
  "{{ site.mlid }}": {
    loc: "{{ site.loc }}",
    title: "{{ site.title }}",
    biburl: "{{ site.biburl }}",
    idx: "{{ site.idx }}"
  },
{%- endfor %}
};

ModelNames["924b850d72bd46478ab650cfa353d94d-1"] = ModelNames["924b850d72bd46478ab650cfa353d94d"];
ModelNames["924b850d72bd46478ab650cfa353d94d-2"] = ModelNames["924b850d72bd46478ab650cfa353d94d"];
ModelNames["924b850d72bd46478ab650cfa353d94d-3"] = ModelNames["924b850d72bd46478ab650cfa353d94d"];
