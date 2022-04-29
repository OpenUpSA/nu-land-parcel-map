export const gPlaceAutocompleteConfig = function (map) {
  return {
    placeholder: "Search for an address...",
    callback: function (place) {
      //Credit: https://stackoverflow.com/questions/14143600/how-to-use-viewport-from-google-geocoder-in-leaflet-js
      if (place.geometry.viewport) {
        map.fitBounds([
          [
            place.geometry.viewport.getSouthWest().lat(),
            place.geometry.viewport.getSouthWest().lng(),
          ],
          [
            place.geometry.viewport.getNorthEast().lat(),
            place.geometry.viewport.getNorthEast().lng(),
          ],
        ]);
      } else if (place.geometry.bounds) {
        map.fitBounds([
          [
            place.geometry.bounds.getSouthWest().lat(),
            place.geometry.bounds.getSouthWest().lng(),
          ],
          [
            place.geometry.bounds.getNorthEast().lat(),
            place.geometry.bounds.getNorthEast().lng(),
          ],
        ]);
      } else {
        // give up, pick an arbitrary zoom level
        map.panTo(place.geometry.location);
        map.setZoom(15);
      }
    },
  };
};
