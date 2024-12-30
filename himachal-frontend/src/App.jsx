
// import './App.css'
// import React from "react";


// function App() {
//   return (
//     <div>
//       <h1>Himachal Pradesh Map</h1>
//       <Map />
//     </div>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Map from './Map';
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




// export default App
