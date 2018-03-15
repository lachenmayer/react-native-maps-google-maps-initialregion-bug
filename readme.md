**This branch adds various log statements on the native & JS side. You can see where I added logs by [comparing this branch to master](https://github.com/lachenmayer/react-native-maps-google-maps-initialregion-bug/compare/debugging).**

This branch also adds a simple fix.

## Order of calls in AirGoogleMap

* `setInitialRegion`
  * `_initialRegion` set - as expected
  * `makeGMSCameraPositionFromMap:andMKCoordinateRegion:` called
    * calculates latDelta/lonDelta as expected
* `didMoveToWindow`
  * deltas != 0 branch taken - as expected
  * `makeGMSCameraPositionFromMap:andMKCoordinateRegion:` called - as expected
* `didPrepareMap`
  * triggers JS `onMapReady`
    * sets `initialRegion` - necessary? https://github.com/lachenmayer/react-native-maps-google-maps-initialregion-bug/blob/master/node_modules/react-native-maps/lib/components/MapView.js#L493
* `idleAtCameraPosition`
  * **`event` has unexpected latDelta/lonDelta**
  * `makeGMSCameraPositionFromMap:andGMSCameraPosition:` called

## Root cause

The `_initialRegionSetOnLoad` flag prevents `setInitialRegion` from setting `initialRegion`.

Commenting out `if (_initialRegionSetOnLoad) return;` fixes the bug, however this means that the initial region can be changed at any time, not just on initialization.

This is not the expected behavior, as per the discussion in https://github.com/react-community/react-native-maps/pull/1950 & https://github.com/react-community/react-native-maps/pull/1953, especially https://github.com/react-community/react-native-maps/pull/1953#issuecomment-356268221

> For this PR, when onLayout is called, map won't be ready on native side. So this.state.isReady will be false and the block won't be executed. When map is finally ready, _onMapReady will be called which'll set the initialRegion or region. That way region will be set correctly. Hope I clearly explained this.

The block does in fact get executed - the native `initialRegion` prop is set in `onLayout`.
The log statement `onLayout set native initialRegion` is shown on screen.

`this.state.isReady` is in fact always true when on iOS! https://github.com/react-community/react-native-maps/blob/master/lib/components/MapView.js#L454

## The solution

The current solution I have found is to change https://github.com/lachenmayer/react-native-maps-google-maps-initialregion-bug/blob/debugging/node_modules/react-native-maps/lib/ios/AirGoogleMaps/AIRGoogleMap.m#L206

```diff
- (void)setInitialRegion:(MKCoordinateRegion)initialRegion {
  NSLog(@"setInitialRegion start: initial[latd:%f lond:%f] region[latd:%f lond:%f]", _initialRegion.span.latitudeDelta, _initialRegion.span.longitudeDelta,  _region.span.latitudeDelta, _region.span.longitudeDelta);
  if (_initialRegionSetOnLoad) return;
  _initialRegion = initialRegion;
-  _initialRegionSetOnLoad = true;
+  _initialRegionSetOnLoad = _didCallOnMapReady;
  self.camera = [AIRGoogleMap makeGMSCameraPositionFromMap:self andMKCoordinateRegion:initialRegion];
  NSLog(@"setInitialRegion end: initial[latd:%f lond:%f] region[latd:%f lond:%f]", _initialRegion.span.latitudeDelta, _initialRegion.span.longitudeDelta,  _region.span.latitudeDelta, _region.span.longitudeDelta);
}
```

With this fix, the map appears as expected, and the flicker (mentioned in the above discussions) does not appear.

However, it is unclear whether `onLayout` should set the native props at all - I wonder if this should be changed instead?
