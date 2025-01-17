import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register required components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
const apiUrl = import.meta.env.VITE_API_URL;

const BarGraph = ({ selectedLog, districtName, selectedDate }) => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedHours, setSelectedHours] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const encodedDistrict = encodeURIComponent(districtName);
        const selectedDeviceEnc = encodeURIComponent(selectedLog);
        const url = `${apiUrl}/fetch/${encodedDistrict}/data?deviceName=${selectedDeviceEnc}&year=${selectedDate.year}&month=${selectedDate.month}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch device data: ${response.statusText}`);
        }

        const responseData = await response.json();
        const data = responseData;
        const dataArray =data.data;
        const dates = dataArray.map((item) => {
          if (!item.activity_date) {
            console.error("Missing activity_date:", item);
            return "Invalid Date"; // Fallback for missing values
          }
        
          try {
            const date = new Date(item.activity_date);
            const istOffset = 5.5 * 60; // IST is UTC+5:30 in minutes
            const istDate = new Date(date.getTime() + istOffset * 60 * 1000);
            if (isNaN(istDate.getTime())) {
              console.error("Invalid date format:", item.activity_date);
              return "Invalid Date"; // Fallback for invalid formats
            }
            return istDate.toISOString().split("T")[0];
          } catch (error) {
            console.error("Error parsing date:", item.activity_date, error);
            return "Invalid Date"; // Fallback for errors
          }
        });
        const hours = dataArray.map((item) => item.total_active_hours);
        setSelectedDates(dates);
        setSelectedHours(hours);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedLog, districtName, selectedDate]);

  // Configure the chart data and options
  const chartData = {
    labels: selectedDates,
    datasets: [
      {
        label: "Total Active Hours",
        data: selectedHours,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Total Active Hours Per Day",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Dates",
        },
      },
      y: {
        title: {
          display: true,
          text: "Hours",
        },
        beginAtZero: true,
        max: 24, // Set the maximum value for the Y-axis to 24
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default BarGraph;
