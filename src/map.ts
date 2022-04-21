import "./map.scss";
import "leaflet/dist/leaflet.css";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import L from "leaflet";
import "leaflet.gridlayer.googlemutant";
import "leaflet-fullscreen";

const LandMap = async function () {
  const map = new L.Map("map", { fullscreenControl: true });  

  L.gridLayer
    .googleMutant({
      type: "roadmap",
    })
    .addTo(map);

  const response = await fetch("https://mapit.code4sa.org/area/9152.geojson");
  const geojson = await response.json();

  const layer = L.geoJSON(geojson, {
    style: {
      color: "#999",
      fillOpacity: 0.01,
      weight: 2,
    },
  }).addTo(map);

  const mapCenter = layer.getBounds().getCenter();
  map.setView(mapCenter, 9);
  console.log(mapCenter);
};

export default LandMap;
