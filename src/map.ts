import "./map.scss";
import "leaflet/dist/leaflet.css";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import L from "leaflet";
import "leaflet.gridlayer.googlemutant";
import "leaflet-fullscreen";
import * as geojson from "./data/complete.json";
import { randomHexColor, hlsGen, cyrb53 } from "./utils";
import "./leaflet-control-legend";
import "./leaflet-control-search";

const urlSearch = new URLSearchParams(window.location.search);
const legendParcelPropertyBlankValue = "NONE";
const legendParcelProperty = urlSearch.get("property") || "Owner";
let legendParcelItems = {};

geojson["features"].forEach((parcel) => {
  let parcelPropertyValue = parcel["properties"][legendParcelProperty]
    .trim()
    .replace(/[\?\(\)]/g, "")
    .toUpperCase();

  if (parcelPropertyValue === "") {
    parcelPropertyValue = legendParcelPropertyBlankValue;
  }

  parcel["properties"][legendParcelProperty] = parcelPropertyValue;
  const hashcode = cyrb53(parcelPropertyValue);
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
      styles: [
        {
          elementType: "geometry.fill",
          stylers: [
            {
              saturation: -100,
            },
          ],
        },
        {
          elementType: "geometry.stroke",
          stylers: [
            {
              saturation: -100,
            },
          ],
        },
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
      color: "#fc0",
      fillOpacity: 0.5,
      fillColor: "#fc0",
      weight: 0,
    },
  }).addTo(map);

  layer.getLayers().forEach((layer) => {
    layer.setStyle({
      fillColor: legendParcelItems[layer.feature.properties[legendParcelProperty]]["color"],
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

  const mapCenter = layer.getBounds().getCenter();
  map.setView(mapCenter, 12);
};

export default LandMap;
