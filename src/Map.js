import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';

const AnyReactComponent = ({ text }) => <div>{text}</div>;

class Map extends Component {
  static defaultProps = {
    center: {
      lat: 9.9189,
      lng: 77.1025
    },
    zoom: 15
  };

  render() {
    return (
      // Important! Always set the container height explicitly
      <div style={{ height: '80vh', width: '80%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key:'AIzaSyDD6JbF-ZQ-4B5_mgIX9hAK7KUi1y8PVPk'  }}
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
        >
          <AnyReactComponent
            lat={9.9189}
            lng={77.1025}
            text="My Marker"
          />
        </GoogleMapReact>
      </div>
    );
  }
}

export default Map