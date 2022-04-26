import "./map.scss";
import "leaflet/dist/leaflet.css";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import L from "leaflet";
import "leaflet.gridlayer.googlemutant";
import "leaflet-fullscreen";
import * as geojson from "./data/complete.json";

const legendParcelProperty = "Owner";
let legendParcelItems = new Set();
geojson["features"].forEach((parcel) => {
  let parcelPropertyValue = parcel["properties"][legendParcelProperty]
    .trim()
    .replace(/[\?\(\)]/g, "")
    .toUpperCase();
  parcelPropertyValue.split(/,|AND/).forEach((value) => {
    if (value) {
      legendParcelItems.add(value.trim());
    }
  });
});

import "./legend-control";

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
      styles: [
        {
          featureType: "road",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "landscape",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    })
    .addTo(map);

  const layer = L.geoJSON(geojson, {
    style: {
      color: "#999",
      fillOpacity: 0.01,
      weight: 1,
    },
  }).addTo(map);

  L.control
    .legend({
      legendItemsChecked: ["CCT"],
      legendItems: Array.from(legendParcelItems).sort(),
    })
    .addTo(map);

  const mapCenter = layer.getBounds().getCenter();
  map.setView(mapCenter, 12);
};

export default LandMap;
