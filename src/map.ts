import "./map.scss";
import "leaflet/dist/leaflet.css";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import L from "leaflet";
import "leaflet.gridlayer.googlemutant";
import "leaflet-fullscreen";
import * as geojson from "./data/complete.json";
import { roundNearest, hlsGen, cyrb53 } from "./utils";
import { orderBy } from "natural-orderby";
import "./controls/legend/index";
import * as mapStyles from "./config/map-style.json";
import * as excludeLegendProperties from "./config/exclude-legend-properties.json";
import * as excludePopupProperties from "./config/exclude-popup-properties.json";
import "leaflet-google-places-autocomplete";
import "./controls/google-places-autocomplete/override.scss"
import {gPlaceAutocompleteConfig} from "./controls/google-places-autocomplete/index.ts";

const urlSearch = new URLSearchParams(window.location.search);
const legendParcelProperty = urlSearch.get("property") || "Owner";
const legendParcelPropertyBucket =
  urlSearch.get("propertyBucket") === "true" || false;
const legendParcelPropertyBucketValue =
  urlSearch.get("propertyBucketValue") || 15000;
const legendParcelPropertyBlankValue =
  urlSearch.get("propertyBlankValue") || "NONE";
let legendParcelItems = {};

geojson["features"].forEach((parcel) => {
  let parcelPropertyValue = parcel["properties"][legendParcelProperty]
    .trim()
    .replace(/[\?\(\)]/g, "");

  if (parcelPropertyValue === "") {
    parcelPropertyValue = legendParcelPropertyBlankValue;
  }

  if (legendParcelPropertyBucket) {
    parcelPropertyValue = roundNearest(
      parcelPropertyValue,
      legendParcelPropertyBucketValue
    );
  }

  parcel["properties"][legendParcelProperty] = parcelPropertyValue;
  const stringSeed = legendParcelPropertyBucket
    ? ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"][
        parseInt(parcelPropertyValue.toString()[0])
      ]
    : "";
  const hashcode = cyrb53(stringSeed + parcelPropertyValue);
  const color = hlsGen(hashcode);

  if (legendParcelItems[parcelPropertyValue]) {
    legendParcelItems[parcelPropertyValue]["count"]++;
  } else {
    legendParcelItems[parcelPropertyValue] = { color: color, count: 1 };
  }
});

const LandMap = async function () {
  const map = new L.Map("map", {
    zoomControl: false,
    attributionControl: false,
  });

  L.control.zoom({ position: "bottomright" }).addTo(map);

  map.addControl(
    new L.Control.Fullscreen({
      position: "bottomright",
    })
  );

  L.gridLayer
    .googleMutant({
      type: "roadmap",
      styles: mapStyles,
    })
    .addTo(map);

  const layers = L.geoJSON(geojson, {
    style: {
      color: "#fc0",
      fillOpacity: 0.5,
      fillColor: "#fc0",
      weight: 1,
    },
  }).addTo(map);

  let legendProperties = [];

  layers.getLayers().forEach((layer) => {
    const color =
      legendParcelItems[layer.feature.properties[legendParcelProperty]][
        "color"
      ];
    layer.setStyle({
      fillColor: color,
      color: color,
    });

    let popup = L.popup();

    const properties = layer.feature.properties;
    const propertyKeys = orderBy(Object.keys(properties));
    legendProperties = propertyKeys.filter((key) => {
      return !excludeLegendProperties.includes(key);
    });
    let contentString = `<div class="parcel-popup-content"><div class="parcel-popup-header">${properties["STR_NAME"]}</div>`;
    contentString +=
      '<table class="parcel-popup-table" cellpadding="0" cellspacing="0">';
    propertyKeys.forEach((key) => {
      if (
        properties[key] !== "" &&
        excludePopupProperties.indexOf(key) === -1
      ) {
        contentString += `<tr><td class="parcel-popup-property-key">${key}:</td> <td class="parcel-popup-property-value">${properties[key]}</td></tr>`;
      }
    });
    contentString += "</table>";
    contentString += "</div>";
    popup.setContent(contentString);
    layer.bindPopup(popup);
    layer.on("mouseover", function (e) {
      e.target.setStyle({
        fillOpacity: 0.75,
      });
    });
    layer.on("mouseout", (e) => {
      e.target.setStyle({
        fillColor: color,
        color: color,
        fillOpacity: 0.5,
      });
    });
  });

  let legendControl = L.control
    .legend({
      legendItemsChecked: ["CCT"],
      legendItems: legendParcelItems,
      legendProperty: legendParcelProperty,
      legendProperties: legendProperties,
      layers: layers,
    })
    .addTo(map);

  let hiddenLayers = [];

  legendControl.on("updatemap", (e) => {
    const checked = e.checked;

    layers.getLayers().forEach((layer) => {
      if (!checked.includes(layer.feature.properties[legendParcelProperty])) {
        hiddenLayers.push(layer);
        layers.removeLayer(layer);
      }
    });

    hiddenLayers.forEach((layer) => {
      if (checked.includes(layer.feature.properties[legendParcelProperty])) {
        layers.addLayer(layer);
      }
    });

    try {
      map.fitBounds(layers.getBounds(), { animate: true });
    } catch (e) {}
  });

  new L.Control.GPlaceAutocomplete(gPlaceAutocompleteConfig(map)).addTo(map);

  map.fitBounds(layers.getBounds(), { animate: true });
};

export default LandMap;
