import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './login.css';

function Login() {
  const [step, setStep] = useState(1); 
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    nid_number: ''
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const res = await axios.post('http://localhost:8081/signin', credentials);

      console.log("Response from server:", res.data); 
      if (res.data.requiresOTP) {
        setEmail(credentials.email); 
        setStep(2);
      } else {
        setErrorMessage('Unexpected server response.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Login failed.');
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const res = await axios.post('http://localhost:8081/verify-otp', {
        email,
        otp
      });

      if (res.data.success) {
        navigate('/profile', { state: { nid_number: credentials.nid_number } });
      }
       else {
        setErrorMessage('Invalid or expired OTP.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'OTP verification failed.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      {step === 1 ? (
        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={credentials.email}
            onChange={handleInputChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={credentials.password}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="nid_number"
            placeholder="NID Number"
            value={credentials.nid_number}
            onChange={handleInputChange}
            required
          />
          <button type="submit">Login</button>
        </form>
      ) : (
        <form onSubmit={handleOTPSubmit}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit">Verify OTP</button>
        </form>
      )}

      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
}

export default Login;
