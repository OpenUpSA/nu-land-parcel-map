# NU Land Parcel Map

Prototype Leaflet map using Ndifuna Ukwazi land parcel data.

## Usage

### Iframe method

You can embed the map using an iframe e.g.

```
<iframe src="https://nu-land-parcel-map.netlify.app"></iframe>
```

It will default to showing land parcels by the `Owner` property. To show land parcels by other properties add a `property` parameter to the URL with the _exact_ `property` name e.g. by `Suburb`

```
<iframe src="https://nu-land-parcel-map.netlify.app?property=Suburb"></iframe>
```

### Import method

You can import the map as a JavaScript module. This is a more complex method but gives you greater control and better performance. A full example is available in [index.html](./src/index.html).

A simple example is:

```
import LandMap from "./map";
import geojson from "./data/complete.json";

LandMap(geojson, "map");
```

Note that in this example you need a `div` with an `id` of `map` e.g.

```
<div id="map"></div>
```

Also be sure to include the script for the Google Maps API as this map relies on the Google Maps base layer.

## Development, Build, Deployment

See [package.json](./package.json)
