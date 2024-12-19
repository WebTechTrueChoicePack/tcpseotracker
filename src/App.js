import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SeoTracker from './components/seotracker/seotracker'; // Ensure this path is correct

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/seotracker" element={<SeoTracker />} />
        {/* Add other routes here as needed */}
      </Routes>
    </Router>
  );
}

export default App;