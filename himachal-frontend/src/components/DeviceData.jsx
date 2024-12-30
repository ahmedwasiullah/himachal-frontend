
import React, { useEffect, useState } from 'react';
import DaysPicker from './DaysPicker';
import { Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function DeviceData({ selectedLog, districtName }) {
  const [deviceData, setDeviceData] = useState({
    totalUpTime: 0.0,
    totalDownTime: 0.0,
    noOfDown: 0,
    noOfUp: 0,
  });
  const [days, setDays] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedDeviceLogs, setSelectedDeviceLogs] = useState([]);

  useEffect(() => {
    if (selectedLog) {
      console.log(`${selectedLog} is coming down as props`);
      setSelectedDevice(selectedLog); // Use `selectedLog` directly
    }

    if (selectedDevice) {
      const url = `http://localhost:8619/fetch/${districtName}?deviceName=${selectedDevice}&days=${days}`;

      const fetchDeviceData = async () => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error('Failed to fetch device data');
          }
          
          const data = await response.json();
          console.log(data);
          setSelectedDeviceLogs(data.logs);
          setDeviceData({
            totalUpTime: data.performanceDeviceData.upTime / 3600,
            totalDownTime: data.performanceDeviceData.downTime / 3600,
            noOfDown: data.performanceDeviceData.downs,
            noOfUp: data.performanceDeviceData.ups,
          });
        } catch (error) {
          console.error('Error fetching device data:', error);
        }
      };

      fetchDeviceData();
    }
  }, [selectedLog, days, districtName, selectedDevice]);

  const chartDataUD = React.useMemo(
    () => ({
      labels: ['No of UP', 'No of Down'],
      datasets: [
        {
          data: [deviceData.noOfUp, deviceData.noOfDown],
          backgroundColor: ['#4caf50', '#f44336'],
          hoverBackgroundColor: ['#388e3c', '#d32f2f'],

        },
      ],
    }),
    [deviceData.noOfUp, deviceData.noOfDown]
  );


  
  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        enabled: true,
      },
      legend: {
        position: 'bottom',
      },
    },
    
    circumference: Math.PI, // Makes the chart a semi-circle (half the full circle)
    rotation: -Math.PI / 2, // Starts the chart from the top (12 o'clock)
    cutout: '70%', // You can adjust the inner radius here for a "donut" look
  };




  const chartDataUT = React.useMemo(
    () => ({
      labels: ['Active_UpTime', 'Inactive_DownTime'],
      datasets: [
        {
          data: [
            deviceData.totalUpTime.toFixed(0),
            deviceData.totalDownTime.toFixed(0),
          ],
          backgroundColor: ['#4caf50', '#f44336'],
        },
      ],
    }),
    [deviceData.totalUpTime, deviceData.totalDownTime]
  );

  const dateConverter = (timeStamp) => {
    const parsedDate = new Date(timeStamp);

    const formattedDate = parsedDate.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short', // Optional: To show the timezone abbreviation
    });
    return formattedDate;
  };


  const handleDaysChanged = (newDays) => {
    setDays(newDays);
    console.log('Selected days:', newDays);
  };

  return (
    <div className="grid-component">
      <div className="centerComponent">
        
          
          <h3 className="head-3">
                {selectedDevice} Device Logs (Last {days} Days)
              </h3>
              <DaysPicker handleDaysChanged={handleDaysChanged} />
            <div className="log-list device-logs">
              <ul>
                <li className='head-li'>
                  <div>DEVICE</div>
                  <div>STATUS</div>
                  <div>TIMESTAMP</div>
                  <div>NAME</div>
                </li>
                {selectedDeviceLogs.map((log) => (
                  <li key={log.timestamp}>
                    <div>{log.ip}</div>
                    <div>{log.status}</div>
                    <div>{dateConverter(log.timestamp)}</div>
                    <div>{log.name}</div>
                  </li>
                ))}
              </ul>
            </div>
          
        
      </div>

      <div className="bottomComponents">
        <div className="pieChartUD piechart">
          <h3>
            {selectedDevice} Historical Data of last ({days}) days
          </h3>
          <Doughnut data={chartDataUD} chartOptions={chartOptions}/>
          <div>
            Stability of device:{' '}
            {(
              (deviceData.noOfUp * 100) /
              (deviceData.noOfUp + deviceData.noOfDown)
            ).toFixed(2)}
            %
          </div>
        </div>
       
       <div></div>

        <div className="pieChartUT piechart">
          <h3>
            {selectedDevice} Data In Terms of Hours of past ({days}) days
          </h3>
          <Pie data={chartDataUT} />
          <div>
            Performance:{' '}
            {(
              (deviceData.totalUpTime * 100) /
              (deviceData.totalUpTime + deviceData.totalDownTime)
            ).toFixed(2)}
            %
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeviceData;
