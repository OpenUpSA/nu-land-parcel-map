import L from "leaflet";
import "./leaflet-control-legend.scss";
import { orderBy } from 'natural-orderby'


L.Control.Legend = L.Control.extend({
  options: {
    position: "bottomleft",
    legendItems: {},
    legendItemsChecked: [],
    legendProperty: ''
  },

  onAdd: function () {
    const legendItemKeys = orderBy(Object.keys(this.options.legendItems));
    const container = L.DomUtil.create("div", "leaflet-control-legend");
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);

    const header = L.DomUtil.create(
      "div",
      "leaflet-control-legend-header",
      container
    );
    const headerButton = L.DomUtil.create(
      "button",
      "leaflet-control-legend-header-button",
      header
    );
    const headerText = L.DomUtil.create(
      "div",
      "leaflet-control-legend-header-text",
      header
    );
    headerText.innerText = `Map legend: ${this.options.legendProperty} (${legendItemKeys.length})`;

    headerButton.addEventListener("click", () => {
      const legend = document.querySelector(".leaflet-control-legend");
      if (legend.classList.contains("collapsed")) {
        legend.classList.remove("collapsed");
      } else {
        legend.classList.add("collapsed");
      }
    });

    const listParent = L.DomUtil.create(
      "ul",
      "leaflet-control-legend-list",
      container
    );


    legendItemKeys.forEach((key) => {
      const item = this.options.legendItems[key];
      const listItem = L.DomUtil.create(
        "li",
        "leaflet-control-legend-list-item",
        listParent
      );

      const listItemLabel = L.DomUtil.create(
        "label",
        "leaflet-control-legend-list-item-label",
        listItem
      );

      let listItemCheckboxWrappper = L.DomUtil.create(
        "span",
        "leaflet-control-legend-list-item-input-wrapper",
        listItemLabel
      );

      let listItemCheckbox = L.DomUtil.create(
        "input",
        "leaflet-control-legend-list-item-input",
        listItemCheckboxWrappper
      );

      listItemCheckboxWrappper.style.setProperty("background-color", item['color']);

      listItemCheckbox.type = "checkbox";
      listItemCheckbox.checked = true;
      listItemCheckbox.value = key;

      let listItemText = L.DomUtil.create(
        "span",
        "leaflet-control-legend-list-item-text",
        listItemLabel
      );

      listItemText.innerText = key;
      listItemLabel.title = key;

      let listItemCount = L.DomUtil.create(
        "span",
        "leaflet-control-legend-list-item-count",
        listItemLabel
      );

      listItemCount.innerText = item['count'];
    });

    return container;
  },
});

L.control.legend = function (options) {
  return new L.Control.Legend(options);
};
