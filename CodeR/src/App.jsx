import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/signup';
import MainApp from './pages/MainApp';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position='top-right' reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/joinee/:roomid" element={<MainApp />} />
        <Route path="/host/:roomid" element={<MainApp />} />
      </Routes>
    </Router>
  );
}

export default App;
