import "./map.scss";
import "leaflet/dist/leaflet.css";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import L from "leaflet";
import "leaflet.gridlayer.googlemutant";
import "leaflet-fullscreen";
import { roundNearest, hlsGen, cyrb53 } from "./utils";
import { orderBy } from "natural-orderby";
import "./controls/legend/index";
import * as mapStyles from "./config/map-style.json";
import * as excludeLegendProperties from "./config/exclude-legend-properties.json";
import * as defaultPopupProperties from "./config/default-popup-properties.json";
import * as CSV from "csv-string";

const LandMap = async function (
  geojson: any,
  mapElementId: string = "map",
  config: object
) {
  const showControls: boolean =
    "showControls" in config ? config["showControls"] : true;
  const legendParcelProperty: string = config["legendParcelProperty"];
  const legendParcelPropertyBucket: boolean =
    config["legendParcelPropertyBucket"] || false;
  const legendParcelPropertyBucketValue: number =
    config["legendParcelPropertyBucketValue"] || 100;
  const legendParcelPropertyBlankValue: string =
    config["legendParcelPropertyBlankValue"] || "NONE";
  const propertyLabels: any = config["propertyLabels"] || [];
  const legendItemsChecked: any = config["legendItemsChecked"] || [];
  const conditionalPopupProperties: any =
    config["conditionalPopupProperties"] || [];
  let propertyKeys = [];

  const map = new L.Map(mapElementId, {
    zoomControl: false,
    attributionControl: false,
  });

  const roadMutant = L.gridLayer
    .googleMutant({
      type: "roadmap",
      styles: mapStyles,
    })
    .addTo(map);

  const satMutant = L.gridLayer.googleMutant({
    maxZoom: 24,
    type: "satellite",
  });

  let legendParcelItems = {};
  let legendProperties = [];

  geojson["features"].forEach((parcel) => {
    let parcelPropertyValue = "";
    try {
      if (parcel["properties"][legendParcelProperty]) {
        parcelPropertyValue = parcel["properties"][legendParcelProperty]
          .trim()
          .replace(/[\?\(\)]/g, "");
      }
    } catch (e) {
      console.log(e);
    }

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

  let layers = new L.FeatureGroup();

  geojson.features.forEach((parcel) => {
    // Change type from LineString to Polygon
    const geo = parcel.geometry;
    const coords = geo.coordinates;
    const first = coords[0];
    const last = coords[coords.length - 1];

    if (
      geo.type === "LineString" &&
      first[0] === last[0] &&
      first[1] === last[1]
    ) {
      parcel.geometry.type = "Polygon";
      parcel.geometry.coordinates = [parcel.geometry.coordinates];
    }
  });

  layers = L.geoJSON(geojson, {
    style: {
      color: "#fc0",
      fillOpacity: 0.5,
      fillColor: "#fc0",
      weight: 1,
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

    let popup = L.popup();

    const properties = layer.feature.properties;
    propertyKeys = orderBy(Object.keys(properties));
    legendProperties = propertyKeys.filter((key) => {
      return !excludeLegendProperties.includes(key);
    });
    let contentString = `<div class="parcel-popup-content"><div class="parcel-popup-header">${properties["Street Name"]}</div>`;
    contentString +=
      '<table class="parcel-popup-table" cellpadding="0" cellspacing="0">';
    propertyKeys.forEach((key) => {
      if (
        defaultPopupProperties.indexOf(key) !== -1 &&
        properties[key] &&
        properties[key] != ""
      ) {
        const propertyLabel = propertyLabels[key] || key;
        const propertyValue = properties[key]
          .replace(/,(?=\S)/g, ", ")
          .replaceAll(" : ", ": ");
        //TODO: Templatise
        contentString += `<tr><td class="parcel-popup-property-key">${propertyLabel}:</td> <td class="parcel-popup-property-value">${propertyValue}</td></tr>`;
      }
    });

    conditionalPopupProperties.forEach((conditional) => {
      if (
        properties[conditional["condition"]["property"]] ===
        conditional["condition"]["value"]
      ) {
        conditional["showProperties"].forEach((key) => {
          const propertyLabel = propertyLabels[key] || key;
          const propertyValue = properties[key]
            .replace(/,(?=\S)/g, ", ")
            .replaceAll(" : ", ": ");
          //TODO: Templatise
          contentString += `<tr><td class="parcel-popup-property-key">${propertyLabel}:</td> <td class="parcel-popup-property-value">${propertyValue}</td></tr>`;
        });
      }
    });

    contentString += "</table>";
    contentString += "</div>";
    popup.setContent(contentString);
    layer.bindPopup(popup, { maxWidth: 500 });
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

  if (showControls) {
    L.control
      .layers(
        {
          Roadmap: roadMutant,
          Satellite: satMutant,
        },
        null,
        { collapsed: false, position: "topright" }
      )
      .addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    map.addControl(
      new L.Control.Fullscreen({
        position: "bottomright",
      })
    );

    let legendControl = L.control
      .legend({
        legendItemsChecked: legendItemsChecked,
        legendItems: legendParcelItems,
        legendProperty: legendParcelProperty,
        legendProperties: legendProperties,
        propertyLabels: propertyLabels,
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

      let csvArray = [];
      csvArray.push(propertyKeys);

      layers.getLayers().forEach((layer) => {
        csvArray.push(layer.feature.properties);
      });

      legendControl.updateDownloadData(CSV.stringify(csvArray));
      console.log({ legendParcelProperty });
      console.log({ checked });
      legendControl.updateTableView(legendParcelProperty, checked);

      try {
        map.fitBounds(layers.getBounds(), { animate: true });
      } catch (e) {}
    });

    legendControl.updateMap(map);
  }

  map.fitBounds(layers.getBounds(), { animate: true });
};

export default LandMap;
