Order of calls in AirGoogleMaps:

* `setInitialRegion`
  * `_initialRegion` set - as expected
  * `makeGMSCameraPositionFromMap:andMKCoordinateRegion:` called
    * calculates latd/lond as expected
* `didMoveToWindow`
  * deltas != 0 branch taken - as expected
  * `makeGMSCameraPositionFromMap:andMKCoordinateRegion:` called - as expected
* `didPrepareMap`
  * triggers JS `onMapReady`
    * sets `initialRegion` - necessary? https://github.com/lachenmayer/react-native-maps-google-maps-initialregion-bug/blob/master/node_modules/react-native-maps/lib/components/MapView.js#L493
* `idleAtCameraPosition`
  * **`event` has unexpected latd/lond**
  * `makeGMSCameraPositionFromMap:andGMSCameraPosition:` called
