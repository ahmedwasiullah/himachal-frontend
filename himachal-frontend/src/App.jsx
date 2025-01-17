
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Map from './components/map';
import DistrictPage from './components/DistrictPage';
import './styles/global.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Map />} />
        <Route path="/district/:districtName" element={<DistrictPage />} />
      </Routes>
    </Router>
  );
};

export default App;
