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

ModelNames["3867f03ae07b43d29630e70b86f7abc9"] = ModelNames["3d0f151bf808494a9eb1b2a81665e832"];
ModelNames["3867f03ae07b43d29630e70b86f7abc9"].title = "Spanienkämpferdenkmal - Relief"

ModelNames["17ebfbf933e345dba395a4169dcbc7d5"] = ModelNames["398e1d82cf6c41369951b15ccfb39df2"];
ModelNames["17ebfbf933e345dba395a4169dcbc7d5"].title = "Volksbühne - Räuberrad"

ModelNames["46af2175f9ee432989d7a0d485ea8302"] = ModelNames["4a413049907c45caa8981829da90def6"];
ModelNames["46af2175f9ee432989d7a0d485ea8302"].title = "Gravestone - Helene"
