import L from "leaflet";
import "./main.scss";
import { orderBy } from "natural-orderby";

L.Control.Legend = L.Control.extend({
  options: {
    position: "bottomleft",
    legendItems: {},
    legendItemsChecked: [],
    legendProperty: "",
    legendProperties: [],
    propertyLabels: {},
  },

  updateMap: function (map) {
    this.fire("updatemap", {
      checked: Array.from(
        map._container.querySelectorAll(
          "input[type=checkbox].leaflet-control-legend-list-item-input:checked"
        ),
        (e: HTMLInputElement) => e.value
      ),
    });
  },

  updateDownloadData: function (data) {
    const blob = new Blob([data], { type: "text/csv" });
    this.headerDownload.href = window.URL.createObjectURL(blob);
  },

  onAdd: function (map) {
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

    this.headerDownload = L.DomUtil.create(
      "a",
      "leaflet-control-legend-header-download",
      header
    );

    this.headerDownload.title = "Download CSV data";
    this.headerDownload.download = "nu-land-map.csv";

    let headerToggleCheckboxWrappper = L.DomUtil.create(
      "span",
      "leaflet-control-legend-list-item-input-wrapper",
      header
    );

    let headerTogggleCheckbox = L.DomUtil.create(
      "input",
      "leaflet-control-legend-header-toggle",
      headerToggleCheckboxWrappper
    );

    headerTogggleCheckbox.type = "checkbox";
    if (this.options.legendItemsChecked.length === 0) {
      headerTogggleCheckbox.checked = true;
    }

    headerTogggleCheckbox.addEventListener("change", () => {
      map._container
        .querySelectorAll(
          "input[type=checkbox].leaflet-control-legend-list-item-input"
        )
        .forEach((item) => {
          item.checked = headerTogggleCheckbox.checked;
        });
      this.updateMap(map);
    });

    const headerText = L.DomUtil.create(
      "div",
      "leaflet-control-legend-header-text",
      header
    );

    const headerSelect = L.DomUtil.create(
      "select",
      "leaflet-control-legend-header-select",
      headerText
    );

    this.options.legendProperties.forEach((property) => {
      const option = L.DomUtil.create(
        "option",
        "leaflet-control-legend-header-select-option",
        headerSelect
      );
      option.innerText = this.options.propertyLabels[property] || property;
      option.value = property;
      if (property == this.options.legendProperty) {
        option.selected = true;
      }
    });

    const headerTextPropertyCount = L.DomUtil.create(
      "span",
      "leaflet-control-legend-header-text-property-count",
      headerText
    );
    headerTextPropertyCount.innerText = `(${legendItemKeys.length})`;

    headerSelect.addEventListener("change", (e) => {
      window.document.location.search = "property=" + e.target.value;
    });

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

      listItemCheckbox.addEventListener("change", (e) => this.updateMap(map));

      listItemCheckboxWrappper.style.setProperty(
        "background-color",
        item["color"]
      );

      listItemCheckbox.type = "checkbox";
      listItemCheckbox.value = key;
      if (
        this.options.legendItemsChecked.length === 0 ||
        this.options.legendItemsChecked.includes(key)
      ) {
        listItemCheckbox.checked = true;
      }

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

      listItemCount.innerText = item["count"];
    });

    return container;
  },
});

L.extend(L.Control.Legend.prototype, L.Evented.prototype);

L.control.legend = function (options) {
  return new L.Control.Legend(options);
};
