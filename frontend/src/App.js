import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './home';
import Register from './register';
import Login from './login';
import RegisterNid from './nidreg';
import VerifyPage from './verfy';
import Candidate from './candidate';
import Admin from './admin'; 
import Profile from './profile';
import ApplyCandidate  from './applycandidate';




function App() {
  return (
    <Router>
      <Routes>
      <Route path="/verify" element={<VerifyPage />} />
        <Route path="/" element={<Home />} />
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="home" element={<Home />} />
        <Route path="nidreg" element={<RegisterNid />} />
        <Route path="verify" element={<VerifyPage />} />
        <Route path="candidate" element={<Candidate />} />
        <Route path="admin" element={<Admin />} /> 
        <Route path="profile" element={<Profile />} />
        <Route path="applycandidate" element={<ApplyCandidate />} />

        
      </Routes>
    </Router>
  );
}

export default App;
