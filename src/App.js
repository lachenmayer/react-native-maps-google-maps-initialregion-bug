import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps' // eslint-disable-line

class BuggyMap extends Component {
  render() {
    console.warn(
      "welcome! :) if you see all of europe, africa & greenland, that's a bug. you should only see london.",
    )
    return (
      <View style={styles.container}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: 51.50853,
            longitude: -0.12574,
            latitudeDelta: 1,
            longitudeDelta: 1,
          }}
          onChange={x => {
            console.log(x.nativeEvent)
          }}
        />
      </View>
    )
  }
}

const styles = {
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
}

export default BuggyMap
