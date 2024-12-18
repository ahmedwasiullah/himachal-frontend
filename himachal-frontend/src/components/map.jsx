import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { geoData } from "./geoData";



const Map = () => {


 

  // Sample GeoJSON Data
  const [geoJsonData, setGeoJsonData] = useState(null);

  useEffect(() => {
    // Fetching the GeoJSON file placed in the public folder
    setGeoJsonData(geoData);

    
    // console.log("data about to be fetch");
    // fetch("/Himachal-pradesh.geojson")
    //   .then((response) => response.json())
    //   .then((data) => setGeoJsonData(data))
    //   .catch((error) => console.error("Error loading GeoJSON:", error));
      
  }, []);



  // Styling the GeoJSON polygons
  const geoJsonStyle = {
    color: "red",
    weight: 2,
    fillColor: "cyan",
    fillOpacity: 0.5,
  };


  // Add popups to GeoJSON features
  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.district) {
      layer.bindPopup(`<b>District: </b>${feature.properties.district}`);
    }
  };

  
  const style = (feature) => {
    // Define color logic based on district properties (for example, district name)
    let fillColor = 'transparent'; // Default color (no fill)
    let borderColor = '#000'; // Default border color

    if (feature.properties && feature.properties.district) {
      switch (feature.properties.district) {
        case 'Lahaul and Spiti':
          fillColor = '#FF5733'; // Red color for Lahaul and Spiti
          borderColor = '#C70039'; // Darker red for border
          break;
        case 'Kullu':
          fillColor = '#33FF57'; // Green color for Kullu
          borderColor = '#28A745'; // Darker green for border
          break;
        // Add more districts with different colors here
        default:
          fillColor = '#B0C4DE'; // Light grey for unspecified districts
          borderColor = '#4682B4'; // Blue border for unspecified
      }
    }

    return {
      fillColor: fillColor,
      color: borderColor, // Border color
      weight: 2,          // Border thickness
      opacity: 1,
      fillOpacity: 0.6,   // Opacity of the district color
    };
  };



  return (

   
    <MapContainer
      center={  [31.957851,
        77.109459]} // Initial map center (Himachal Pradesh)
      zoom={8}
      zoomControl={false} // Disable zoom controls
      scrollWheelZoom={false} // Disable scroll wheel zoom
      touchZoom={false} // Disable touch zoom (on mobile devices)
      dragging={false}
      doubleClickZoom={false} // Disable double-click zoom

      style={{ height: "700px", width: "800px" }}
    >
      {/* Add OpenStreetMap tiles */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
        tileSize={256}
        
        zoomControl={false}
        noWrap
        opacity={0}
        touchZoom={false} // Disable touch zoom (on mobile devices)
        scrollWheelZoom={false} // Disable scroll wheel zoom
        dragging={false}


      />

     <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'white',
          zIndex: 0,
        }}
      />
      {/* Add GeoJSON Layer when data is loaded */}
      {geoJsonData && (
        <GeoJSON
          data={geoJsonData}
          style={style}
          onEachFeature={onEachFeature}
        />
      )}
    </MapContainer>
  );
};

export default Map;
