import "./map.scss";
import "leaflet/dist/leaflet.css";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import L from "leaflet";
import "leaflet.gridlayer.googlemutant";
import "leaflet-fullscreen";
import * as geojson from "./data/complete.json";
import { roundNearest, hlsGen, cyrb53 } from "./utils";
import { orderBy } from "natural-orderby";
import "./leaflet-control-legend";
import "./leaflet-control-search";
import * as mapStyles from "./map-style.json";

const excludeShowingProperties = ["path"];
const urlSearch = new URLSearchParams(window.location.search);
const legendParcelProperty = urlSearch.get("property") || "Owner";
const legendParcelPropertyBucket =
  urlSearch.get("propertyBucket") === "true" || false;
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
    parcelPropertyValue = roundNearest(parcelPropertyValue);
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
      weight: 0,
    },
  }).addTo(map);

  layers.getLayers().forEach((layer) => {
    const color =
      legendParcelItems[layer.feature.properties[legendParcelProperty]][
        "color"
      ];
    layer.setStyle({
      fillColor: color,
      color: color,
    });

    let popup = L.popup({
      className: "tooltip",
      closeButton: false,
    });

    const properties = layer.feature.properties;
    const propertyKeys = orderBy(Object.keys(properties));
    let contentString = `<div class="parcel-popup-content"><div class="parcel-popup-header">${properties["STR_NAME"]}</div>`;
    contentString +=
      '<table class="parcel-popup-table" cellpadding="0" cellspacing="0">';
    propertyKeys.forEach((key) => {
      if (
        properties[key] !== "" &&
        excludeShowingProperties.indexOf(key) === -1
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
        weight: 1,
        fillOpacity: 0.75,
      });
    });
    layer.on("mouseout", (e) => {
      e.target.setStyle({
        fillColor: color,
        color: color,
        weight: 0,
        fillOpacity: 0.5,
      });
    });
  });

  L.control
    .legend({
      legendItemsChecked: ["CCT"],
      legendItems: legendParcelItems,
      legendProperty: legendParcelProperty,
    })
    .addTo(map);

  L.control.search().addTo(map);

  const mapCenter = layers.getBounds().getCenter();
  map.setView(mapCenter, 12);
};

export default LandMap;
