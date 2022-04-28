import L from "leaflet";
import "./leaflet-control-search.scss";

L.Control.Search = L.Control.extend({
  options: {
    position: "topright",
    legendItems: {},
    legendItemsChecked: [],
  },

  onAdd: function () {
    const container = L.DomUtil.create("div", "leaflet-control-search");
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);

    const input = L.DomUtil.create(
      "input",
      "leaflet-control-search-input",
      container
    );

    input.type = "text";
    input.placeholder = "Search for anything...";

    return container;
  },
});

L.control.search = function (options) {
  return new L.Control.Search(options);
};
