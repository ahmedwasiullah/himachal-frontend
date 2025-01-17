import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Doughnut,Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import DeviceData from './DeviceData';
import BarGrarph from './BarGraph';
import MPicker from './MPicker';
import '../styles/global.css';
ChartJS.register(ArcElement, Tooltip, Legend);
const apiUrlws = import.meta.env.VITE_API_URL_WS;

const DistrictPage = () => {
  const {districtName} = useParams();
  const navigate = useNavigate();
  const[messages,setMessages]=useState(null);
  const messageRef=useRef(null);
  const[logs,setLogs]=useState([]);
  const [totalDevices,setTotalDevices]=useState( { active: 0, inactive: 0 });
  const [selectedLog,setSelectedLog]= useState(""); 
  const[selectedDate,setSelectedDate]=useState({
    month: new Date().getMonth()+1,
    year: new Date().getFullYear(),
  }); 
  const [waitingToReconnect, setWaitingToReconnect] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const socketRef = useRef(null); 
  useEffect(() => {
    if(!socketRef.current){
      let socket = new WebSocket(`${apiUrlws}/dashboard/${districtName}`);
      socketRef.current=socket;
      window.socket=socket;
      socket.onopen = () => {
        // console.log('WebSocket connected success');
        setIsOpen(true);
      };

      socket.onmessage = (event) => {        
        try {      
          // console.log(`WebSocket recived a message ${event.data}`);
           const data=JSON.parse(event.data);
            setMessages(data);  
        } catch (error) {
          console.log("error",error);
        }
      };
    
      socket.onclose = () => {
        setIsOpen(false);
        console.log('ws closed');
        setWaitingToReconnect(true);
        setTimeout(() => setWaitingToReconnect(null), 500); 
      };
    
      return () => {
        socketRef.current=null;
        socket.close();
      };  
    }
      
    
  }, [waitingToReconnect]);


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
          backgroundColor: ['#388e3c', '#d32f2f'],
          hoverBackgroundColor: ['#388e3c', '#d32f2f'],
        },
      ],
    }), [totalDevices.active, totalDevices.inactive]);


  


  const clickedLog= (log)=>{
    // console.log("log is clicked");
    setSelectedLog(log.name);
    // console.log(`${selectedLog} is selected`);
  };

  const dateClicked=(date)=>{
    setSelectedDate(date);
    // console.log(selectedDate);

  }
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
      <h1>{districtName}</h1>
        <div className='topComponent'>
         {/* top component has two columns */}
             <div className="piechart">
               <h3>Network Status</h3>
               <Doughnut data={chartData} />
               <div><b>Total Devices: {totalDevices.active + totalDevices.inactive}</b></div>
               <div><b>Network Stability: {(totalDevices.active*100/(totalDevices.active + totalDevices.inactive)).toFixed(2)}%</b></div>
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

         <div className='bargraphComponent'>
         <div className='graph'>
             {selectedLog && <MPicker datePicked={dateClicked}/>}
            {selectedLog && <BarGrarph selectedLog={selectedLog} districtName={districtName} selectedDate={selectedDate} />}
          </div>
              
         </div>
        
      </div>
   </>
  );
};
}
export default DistrictPage;
