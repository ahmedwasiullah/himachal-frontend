
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
import { use } from "react";
const apiUrl = import.meta.env.VITE_API_URL_WS;

const Map = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const[downLogs,setDownLogs]=useState([]);
  const messagesRef = useRef([]);
  const downRef = useRef([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTopics, setFilteredTopics] = useState([]);
  const successRef = useRef([]);
  const failureRef = useRef([]);
  const[isDisconnected,setIsDisconnected]=useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDanger, setShowDanger] = useState(false);
  const [successData,setSuccessData]=useState([]);
  const [failureData,setFailureData]=useState([]);
  const [waitingToReconnect, setWaitingToReconnect] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const socketRef = useRef(null); 


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

  const[controlRoomchartData,SetcontrolRoomChartData]=useState({
    labels: ['Active', 'Inactive'],

    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#4caf50', '#f44336'],
        hoverBackgroundColor: ['#388e3c', '#d32f2f'],
      },
    ],
  });
  
  const[virtualMachinechartData,SetvirtualMachineChartData]=useState({
    labels: ['Active', 'Inactive'],

    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#4caf50', '#f44336'],
        hoverBackgroundColor: ['#388e3c', '#d32f2f'],
      },
    ],
  });

  const[fireWallchartData,SetFirewallChartData]=useState({
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
    if (waitingToReconnect) {
      return;
    }

      if(!socketRef.current) {
        const socket = new WebSocket(`${apiUrl}/dashboard`);
        socketRef.current=socket;
        window.socket=socket;
    socket.onopen = () => {
      setIsOpen(true);
      setIsDisconnected(false);
    };
  
    socket.onmessage = (event) => {
      
      try {      
         const data=JSON.parse(event.data);
    
        setMessages(data.districtActivityLogs);  
        setDownLogs(data.downLogs);
        const success = data.success;
        const failure = data.failure;
        
        if (success.length > 0) {
          setSuccessData(success); // Set success data
          showSuccessAlert(); // Show success alert
        }
        
        if (failure.length > 0) {
          setFailureData(failure); // Set failure data
          showDangerAlert(); // Show danger alert
        }
      } catch (error) {
        
        console.log("error",error);
      }
    };
  
    socket.onclose = () => {
    setIsDisconnected(true);
    setIsOpen(false);
    console.log('ws closed');
    setWaitingToReconnect(true);
    setTimeout(() => setWaitingToReconnect(null), 5000);
    };
  
    return () => {
      socketRef.current=null;
      socket.close();
    }; 

   }   
    
  }, [waitingToReconnect]);





  useEffect(() => {
    messagesRef.current = messages;
    downRef.current=downLogs;
  }, [messages]);

  
useEffect(() => {
  const data = messagesRef.current;

  // Calculate total active and inactive devices
  const totalDevice = data.reduce(
    (acc, item) => {
      acc.active += item.active_devices;
      acc.inactive += item.inactive_devices;
      return acc;
    },
    { active: 0, inactive: 0 }
  );

  // Helper function to create chart data
  const createChartData = (active, inactive) => ({
    labels: ['Active', 'Inactive'],
    datasets: [
      {
        data: [active, inactive],
        backgroundColor: ['#4caf50', '#f44336'],
        hoverBackgroundColor: ['#388e3c', '#d32f2f'],
      },
    ],
  });

  // Generate chart data for specific districts
  data.forEach((region) => {
    const chartData = createChartData(region.active_devices, region.inactive_devices);

    switch (region.district) {
      case 'Virtual Machine':
        SetvirtualMachineChartData(chartData);
        break;
      case 'Control Room':
        SetcontrolRoomChartData(chartData);
        break;
      case 'Firewall':
        SetFirewallChartData(chartData);
        break;
      default:
        break;
    }
  });

  // Set total devices and overall chart data
  setTotalDevices(totalDevice);
  SetChartData(createChartData(totalDevice.active, totalDevice.inactive));
}, [messages]);


const showDangerAlert = async () => {
  setShowDanger(true);
  setTimeout(() => setShowDanger(false), 10000); // Hide after 20 seconds
};

const showSuccessAlert = async() => {
  setShowSuccess(true);
  setTimeout(() => setShowSuccess(false), 15000); // Hide after 5 seconds
};

useEffect(()=>{
  successRef.current=successData;
  failureRef.current=failureData;
},[successData,failureData])

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
  

          layer.bringToFront();

        },
        mouseout: () => {
          layer.closeTooltip(); // Close the tooltip when the mouse leaves the layer
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

  const clickedExtra=(log)=>{
    if(log){
    navigate(`/district/${log}`);
    }
  };

  const getClassBasedOnHours = (hrs) => {
    if (hrs < 1) {
      return "bg-less-than-1hrs";
    } else if (hrs < 8) {
      return "bg-less-than-4hrs";
    } 
     else if (hrs < 12) {
      return "bg-less-than-12hrs";
    } else if (hrs < 24) {
      return "bg-less-than-24hrs";
    } else {
      return "bg-more-than-24hrs";
    }
  };
 
  function getClassBasedOnPercentage(percentage) {
    if (percentage >= 75) {
        return 'high-connectivity';
    } else if (percentage >= 50) {
        return 'moderate-connectivity';
    } else if (percentage >= 0) {
        return 'low-connectivity';
    } else {
        return 'no-connectivity';
    }
}



useEffect(() => {
  const filteredAndSortedLogs = downLogs
  .filter(log =>
    log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.ip.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  setFilteredTopics(filteredAndSortedLogs);
}, [downLogs, searchTerm]);

  const dateConverter = (timeStamp) => {
    const date = new Date(timeStamp);
    const humanReadableDate = date.toLocaleString('en-IN', {
      year: 'numeric',   // Full year (e.g., 2024)
      month: 'long',     // Full month (e.g., November)
      day: 'numeric',    // Day of the month (e.g., 16)
      hour: 'numeric',   // Hour (e.g., 3)
      minute: 'numeric', // Minute (e.g., 00)
      second: 'numeric', // Second (e.g., 00)
      timeZone: 'Asia/Kolkata',  // Set the time zone to IST (Asia/Kolkata)
      // timeZoneName: 'short' // Time zone abbreviation (e.g., IST)
    });
    return humanReadableDate;
  };
 

  return (
    <div className="main-container">
    {showSuccess && (
        <div className="alert alert-success alert-dismissible fade show alert-position alert-succ" role="alert">
            {
             `Devices: ${successRef.current.map(item => `${item.name} from (${item.district})`).join(", ")} have successfully came back online.`
            }
          <button
            type="button"
            className="close"
            data-dismiss="alert"
            aria-label="Close"
            onClick={() => setShowSuccess(false)}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}

      {showDanger && (
        <div className="alert alert-danger alert-dismissible fade show alert-position alert-dan" role="alert">
         { `Devices: ${failureRef.current.map(item => `${item.name} from (${item.district})`).join(", ")} have gone offline.`}
          <button
            type="button"
            className="close"
            data-dismiss="alert"
            aria-label="Close"
            onClick={() => setShowDanger(false)}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}


{isDisconnected && (
        <div className="alert alert-danger alert-dismissible fade show alert-position alert-dan" role="alert">
          You are Offline,Please wait or check your internet connection.
        </div>
      )}



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
          keyboard={false}
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

    <div className="row-mid">
     <div className="control-room-pie" title="Click for insights" onClick={()=>clickedExtra("Control Room")}>
     <div className="piechart">
    
    <h3>Control Room Status</h3>
    <Doughnut data={controlRoomchartData} />
    <h4>Total Devices: 12</h4>
    {/* <h4>Total Devices: {totalDevices.active + totalDevices.inactive}</h4> 
    <h4>Network Stability: {(totalDevices.active*100/(totalDevices.active + totalDevices.inactive)).toFixed(2)}%</h4> */}
     </div>
     </div>
     <div className="virtual-machine-pie" title="Click for insights" onClick={()=>clickedExtra("Virtual Machine")}>
     <div className="piechart">
    
    <h3>Virtual Machine's Status</h3>
    <Doughnut data={virtualMachinechartData} />
    <h4>Total Virtual Machines: 22</h4>
    {/* <h4>Total Devices: {totalDevices.active + totalDevices.inactive}</h4> 
    <h4>Network Stability: {(totalDevices.active*100/(totalDevices.active + totalDevices.inactive)).toFixed(2)}%</h4> */}

  </div>
     </div>
     <div className="firewall-pie" title="Click for insights" onClick={()=>clickedExtra("Firewall")}>
     <div className="piechart">
    
    <h3>Firewall Status</h3>
    <Doughnut data={fireWallchartData} />
    <h4>Total Firewalls: 1</h4> 
    {/*// <h4>Network Stability: {(totalDevices.active*100/(totalDevices.active + totalDevices.inactive)).toFixed(2)}%</h4> */}
  </div>
     </div>
    </div>

    <div className="row-lower-mid">
    <div className="log">
      <div id="searchhead">
    <h2 className="sectionHeader"> Down Devices Over The Network</h2>

    <div className="search-box">
    <button className="btn-search"><i className="search-icon"></i></button>
    <input type="text" className="input-search" placeholder="Search logs..."  value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}/>
  </div>
    </div>
    
    <div className="log-list">
    <ul>
    <li className={`downlog-li-head`}>
      <div>Device Name</div>
      <div>IP address</div>
      <div>Status</div>
      <div>District</div>
      <div>Timestamp</div>
      <div>Inactive Hours</div>
    </li>

        {filteredTopics.length > 0 ? (
          filteredTopics.map((log) => (
            <li key={log.name} className={`downlog-li ${getClassBasedOnHours(log.inactive_hrs)}`}>     
            <div>{log.name}</div>
            <div>{log.ip}</div>
            <div>{log.status}</div>
            <div>{log.district }</div>
            <div>{dateConverter(log.timestamp)}</div>
            <div>{(log.inactive_hrs).toFixed(2)}</div>
          </li>
          ))
        ) : (
          <li>
          </li>
        )}
      </ul>

  <ul>
   
  </ul>
  {/* {loading && <div>Loading logs...</div>}
  {error && <div>{error}</div>} */}
</div>
     </div> 
     
    </div>
    

    <div className="row-2">
    <div className="log">
    <h2 className="sectionHeader">Network Over The State</h2>
    <div className="log-list">
  <ul>
    <li className="head-li">
      <div>District Name</div>
      <div>Active Devices</div>
      <div>Inactive Devices</div>
      <div>Up Percentange</div>
    </li>



    {messagesRef.current.map((log) => (
    <li key={log.district} className={`${getClassBasedOnPercentage((log.active_devices * 100 / (log.active_devices + log.inactive_devices)))}`} 
    onClick={() => clickedLog(log)}>     
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


