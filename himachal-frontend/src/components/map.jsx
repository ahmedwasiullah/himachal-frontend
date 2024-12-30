
import React, { useEffect, useState ,useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { geoData } from "./geoData";
import { useNavigate } from 'react-router-dom';
// import { use } from "react";
import { Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);
import '../styles/global.css';

const Map = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef([]);
  
  const [totalDevices,setTotalDevices]=useState( { active: 0, inactive: 0 });
  const[chartData,SetChartData]=useState({
    labels: ['Active', 'Inactive'],

    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#4caf50', '#f44336'],
        hoverBackgroundColor: ['#388e3c', '#d32f2f'],
      },
    ],
  });
  
  useEffect(() => {
    setGeoJsonData(geoData);
  }, []);


  

  useEffect(() => {
    let socket = new WebSocket('ws://localhost:8619/dashboard');
    socket.onopen = () => {
      console.log('WebSocket connected success');
    };
  
    socket.onmessage = (event) => {
      
      try {      
        console.log(`WebSocket recived a message ${event.data}`);
         const data=JSON.parse(event.data);
         console.log(`WebSocket recived a message ${data}`);
        setMessages(data);  
        
      } catch (error) {
        console.log("error",error);
      }
    };
  
    socket.onclose = () => {
      console.log('WebSocket disconnected');
    };
  
    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);



  
  useEffect(()=>{
    const data=messagesRef.current;
    const totalDevice = data.reduce((acc, item) => {
      acc.active += item.active_devices;
      acc.inactive += item.inactive_devices;
      return acc;
    }, { active: 0, inactive: 0 });
    
    setTotalDevices(totalDevice);
    const chartDataLocal = {
      labels: ['Active', 'Inactive'],
  
      datasets: [
        {
          data: [totalDevice.active, totalDevice.inactive],
          backgroundColor: ['#4caf50', '#f44336'],
          hoverBackgroundColor: ['#388e3c', '#d32f2f'],
        },
      ],
    };
     SetChartData(chartDataLocal);
// component two

  },[messages]);


  const geoJsonStyle = {
    color: "red",
    weight: 2,
    fillColor: "cyan",
    fillOpacity: 0.5,
  };

  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.district) {
      layer.bindPopup(`<b>District: </b>${feature.properties.district}`);
      const districtName = feature.properties.district;
  
      // Add hover event to change color and show tooltip
      layer.on({
        mouseover: (e) => {
              const data=messagesRef.current;      
          const currDistrict = data.find(
            (item) => feature.properties.district.toLowerCase() === item.district.toLowerCase()
          );

          const deviceInfo = { 
            active: currDistrict.active_devices, 
            inactive: currDistrict.inactive_devices 
          };
            const tooltipContent = `
            <b>District:</b> ${districtName}<br />
            <b>Active Devices:</b> ${deviceInfo.active}<br />
            <b>Inactive Devices:</b> ${deviceInfo.inactive}`;
          layer.bindTooltip(tooltipContent, {
            sticky: true,
            direction: "top",
            offset: [0, -10],
          }).openTooltip(e.latlng);
  
          // // Change the style on hover
          // layer.setStyle({
          //   fillColor: "black", // Set fill color to black
          //   color: "black",     // Set border color to black
          //   weight: 2,
          //   fillOpacity: 0.7,
          // });

          layer.bringToFront();

        },
        mouseout: () => {
          layer.closeTooltip(); // Close the tooltip when the mouse leaves the layer
  
          // Reset to default style
          // layer.setStyle(defaultStyle);
        },
      }); 

      // Add a click event to each district polygon
      layer.on('click', () => handleDistrictClick(feature));
    }
  };

  const style = (feature) => {
    let fillColor = 'transparent';
    let borderColor = '#000';
  
    // Find the current district's data

    const currDistrict = messages.find(
      (item) => feature.properties.district.toLowerCase() === item.district.toLowerCase()
    );
  
    if (currDistrict) {
      const totalDevices = currDistrict.active_devices + currDistrict.inactive_devices;
      const percentage = totalDevices > 0 
        ? (currDistrict.active_devices * 100) / totalDevices 
        : 0; // Handle division by zero if no devices
  
      if (percentage >= 75) {
        
        fillColor = '#33FF57'; // Green for high connectivity
          borderColor = '#28A745';
      } else if (percentage >= 50) {
        fillColor = '#FFD700'; // Yellow for moderate connectivity
        borderColor = '#FFD700';          
      } else if (percentage >= 0) {
        fillColor = '#FF5733'; // Red for low connectivity
        borderColor = '#C70039';
      } else {
        fillColor = '#B0C4DE'; // Grey for no connectivity
        borderColor = '#B0C4DE';
      }
  
       // Keep border consistent
    } else {
      // Default color for districts without data
      fillColor = '#B0C4DE'; // Light blue
      borderColor = '#4682B4'; // Steel blue
    }
  
    return {
      fillColor: fillColor,
      color: borderColor,
      weight: 2,
      opacity: 1,
      fillOpacity: 0.6,
    };
  };
  

  const handleDistrictClick = (feature) => {
    if (feature.properties && feature.properties.district) {
      const districtName = feature.properties.district;
      navigate(`/district/${districtName}`);
    }
  };



  const clickedLog=(log)=>{
    if(log){
    navigate(`/district/${log.district}`);
    }
  };


  

 

  return (
    <div className="main-container">
    
    <div className="grids-container">
    <div className="map-col">
     <MapContainer
        center={[31.957851, 77.109459]}
         zoom={8}
         zoomControl={false}
         scrollWheelZoom={false}
         touchZoom={false}
          dragging={false}
          doubleClickZoom={false}
          style={{ height: "100%", width: "100%",position:"relative",backgroundColor:"white" }}
      >

     <div
        style={{
          position: 'relative',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'white',
          zIndex: 0,
        }}
      />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
          tileSize={256}
          zoomControl={false}
          noWrap
          opacity={0}
          touchZoom={false}
          scrollWheelZoom={false}
          dragging={false}
        />

        {geoJsonData && (
          <GeoJSON
            data={geoData}
            style={style}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
    <div className="col-2-container">

    <div className="piechart">
    
      <h3>Total Network Status</h3>
      <Doughnut data={chartData} />
      <h4>Total Devices: {totalDevices.active + totalDevices.inactive}</h4> 
      <h4>Network Stability: {(totalDevices.active*100/(totalDevices.active + totalDevices.inactive)).toFixed(2)}%</h4>
  
    </div>
</div>
    </div>
    <div className="row-2">
    <div className="log">
    <div className="log-list">
      <h2>Network Over The Districts</h2>
  <ul>
    <li className="head-li">
      <div>District Name</div>
      <div>Active Devices</div>
      <div>Inactive Devices</div>
      <div>Up Percentange</div>
    </li>
    {messagesRef.current.map((log) => (
    <li key={log.district} onClick={() => clickedLog(log)}>     
      <div>{log.district}</div>
      <div>{log.active_devices}</div>
      <div>{log.inactive_devices}</div>
      <div>{(log.active_devices * 100 / (log.active_devices + log.inactive_devices)).toFixed(2)}%</div>
    </li>
  ))}
  </ul>
  {/* {loading && <div>Loading logs...</div>}
  {error && <div>{error}</div>} */}
</div>
     </div>
    </div>
  </div>
  );
};

export default Map;


