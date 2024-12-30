import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import DeviceData from './DeviceData';


ChartJS.register(ArcElement, Tooltip, Legend);

const DistrictPage = () => {
  const {districtName} = useParams();
  const navigate = useNavigate();
  const[messages,setMessages]=useState(null);
  const messageRef=useRef(null);
  const[logs,setLogs]=useState([]);
  const [totalDevices,setTotalDevices]=useState( { active: 0, inactive: 0 });
  const [selectedLog,setSelectedLog]= useState("");  
  // const selectedLogRef=useRef(null);
  useEffect(() => {
      let socket = new WebSocket(`ws://localhost:8619/dashboard/${districtName}`);
      socket.onopen = () => {
        console.log('WebSocket connected success');
      };

      socket.onmessage = (event) => {        
        try {      
          console.log(`WebSocket recived a message ${event.data}`);
           const data=JSON.parse(event.data);
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


  useEffect(()=>{
    messageRef.current=messages;
    if(messageRef.current){
    setLogs(messageRef.current.log);
    const totalDevice={active : messageRef.current.data.active_devices , inactive : messageRef.current.data.inactive_devices};
    setTotalDevices(totalDevice);
    }
  }
  ,[messages]);

  const goHome = () => {
    navigate('/'); // Navigate back to the main map page
  };

  {
    const chartData = React.useMemo(() => ({
      labels: ['Active', 'Inactive'],
      datasets: [
        {
          data: [totalDevices.active, totalDevices.inactive],
          backgroundColor: ['#4caf50', '#f44336'],
          hoverBackgroundColor: ['#388e3c', '#d32f2f'],
        },
      ],
    }), [totalDevices.active, totalDevices.inactive]);


  


  const clickedLog= (log)=>{
    console.log("log is clicked");
    setSelectedLog(log.name);
    console.log(`${selectedLog} is selected`);
  };

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
    <>
      <button onClick={goHome} style={{ position: 'absolute', top: 10, left: 10 }}>Home</button>
      
      <div className='container-grid-district'>
      <h1>{districtName} District</h1>
        <div className='topComponent'>
         {/* top component has two columns */}
             <div className="piechart">
               <h3>Network Status</h3>
               <Pie data={chartData} />
               <div>Total Devices: {totalDevices.active + totalDevices.inactive}</div>
               <div>Network Stability: {(totalDevices.active*100/(totalDevices.active + totalDevices.inactive)).toFixed(2)}%</div>
             </div>
             <div className="log district-log">
             <div className="log-list">
               <h3>Last Status Of The Device</h3>
           <ul>
             <li className='head-li'>
               <div>Ip Address</div>
               <div>Status</div>
               <div>Time Stamp</div>
               <div>Device Name</div>
             </li>
             
             {logs.map((log,index) => (
      <li key={log.ip+index} onClick={() => clickedLog(log)}
      className={selectedLog === log.name ? 'selected' : ''}
      >
        <div>{log.ip}</div>
        <div>{log.status}</div>
        <div>{dateConverter(log.timestamp)}</div>
        <div>{log.name}</div>
      </li>
    ))}
           </ul>
           {/* {loading && <div>Loading logs...</div>}
           {error && <div>{error}</div>} */}
         </div>
       </div>


   </div>
        <div className='centerbottomComponent'>
         {/*  Selected Device Logs */}

          <div>
            {selectedLog && <DeviceData selectedLog={selectedLog} districtName={districtName} />}
          </div>
         </div>
        
      </div>
   </>
  );
};
}
export default DistrictPage;
