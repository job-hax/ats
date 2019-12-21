import React from "react";
import { compose, withProps } from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker
} from "react-google-maps";
import MarkerClusterer from "react-google-maps/lib/components/addons/MarkerClusterer";

import { googleApiKey } from "../../../../config/config.js";

const MapComponent = compose(
  withProps({
    googleMapURL:
      "https://maps.googleapis.com/maps/api/js?key=" +
      googleApiKey +
      "&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `100%` }} />,
    mapElement: <div style={{ height: `100%` }} />
  }),
  withScriptjs,
  withGoogleMap
)(props => (
  <GoogleMap
    id="marker-example"
    mapContainerStyle={{
      height: "400px",
      width: "800px"
    }}
    zoom={10}
    center={props.defaultCenter}
  >
    {props.isMarkerShown && (
      <MarkerClusterer>
        {props.positions.map((location, i) => (
          <Marker key={i} position={location} />
        ))}
      </MarkerClusterer>
    )}
  </GoogleMap>
));

class Map extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isMarkerShown: false
    };

    this.handleMarkerClick = this.handleMarkerClick.bind(this);
    this.delayedShowMarker = this.delayedShowMarker.bind(this);
  }

  componentDidMount() {
    this.delayedShowMarker();
  }

  delayedShowMarker() {
    setTimeout(() => {
      this.setState({ isMarkerShown: false });
    }, 3000);
  }

  handleMarkerClick() {
    this.setState({ isMarkerShown: false });
    this.delayedShowMarker();
  }

  render() {
    return (
      <MapComponent
        isMarkerShown={this.state.isMarkerShown}
        onMarkerClick={this.handleMarkerClick}
        defaultCenter={this.props.defaultCenter}
        positions={this.props.positions}
      />
    );
  }
}

export default Map;
