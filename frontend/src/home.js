import React from "react";
import { Link, useNavigate } from "react-router-dom";
import './home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="main">
      <div className="navbar">
        <div className="logo">
          <img src="projectlogo.png" alt="NID Portal Logo" />
        </div>
        <div className="menu">
          <ul>
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/admin">Admin</Link></li>
          </ul>
        </div>
      </div>

      <div className="hero-section">
        <div className="hero-overlay">
          <h1 className="hero-title">Welcome to the NID Portal</h1>
          <p className="hero-subtitle">National Identity Services at Your Fingertips</p>

          <div className="card-grid">
            <div className="glass-card">
              <h3>Don't have an account?</h3>
              <p>If you have a NID, you can create one now.</p>
              <button className="glass-button" onClick={() => navigate('/register')}>Register</button>
            </div>

            <div className="glass-card">
              <h3>Already Registered?</h3>
              <p>If you already have an account, log in here.</p>
              <button className="glass-button" onClick={() => navigate('/login')}>Login</button>
            </div>

            <div className="glass-card">
              <h3>Apply for NID</h3>
              <p>If you don't have a National ID, apply here.</p>
              <button className="glass-button" onClick={() => navigate('/nidreg')}>Get Started</button>
            </div>

            <div className="glass-card">
              <h3>Cast Your Vote</h3>
              <p>The voting portal is open. Proceed to vote now.</p>
              <button className="glass-button" onClick={() => navigate('/verify')}>Cast Your Vote</button>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
