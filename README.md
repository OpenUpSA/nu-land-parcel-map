# NU Land Parcel Map

Prototype Leaflet map using Ndifuna Ukwazi land parcel data.

## Usage

### Iframe method

You can embed the map using an iframe e.g.

```
<iframe src="https://nu-land-parcel-map.netlify.app"></iframe>
```

It will default to showing land parcels by the `Owner` property. To show land parcels by other properties add a `property` parameter to the URL with the *exact* `property` name e.g. by `Suburb`

```
<iframe src="https://nu-land-parcel-map.netlify.app?property=Suburb"></iframe>
```

## Development, Build, Deployment

See [package.json](./package.json)
