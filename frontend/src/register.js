import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './register.css';

function Register() {
  const [getvalues, setValues] = useState({
    full_name: '',
    email: '',
    password: '',
    address: '',
    nid_number: ''
  });

  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setValues({
      ...getvalues,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      await axios.post('http://localhost:8081/register', getvalues);
      navigate('/login');
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          setErrorMessage('Your NID and email do not match our records.');
        } else if (error.response.status === 409) {
          setErrorMessage(error.response.data.error);
        } else {
          setErrorMessage('Registration failed. Please try again.');
        }
      } else {
        setErrorMessage('Network error. Please try again.');
      }
    }
  };

  return (
    <div className="main">
      <div className="register-container">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="full_name" placeholder="Full Name" value={getvalues.full_name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={getvalues.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={getvalues.password} onChange={handleChange} required />
          <input type="text" name="address" placeholder="Present Address" value={getvalues.address} onChange={handleChange} required />
          <input type="text" name="nid_number" placeholder="NID Number" value={getvalues.nid_number} onChange={handleChange} required />
          <button type="submit">Register</button>
          <button type="button" onClick={() => navigate('/login')}>Already have an account? Sign In</button>
          <button type="button" onClick={() => navigate('/home')}>Go to Home</button>
        </form>
        {errorMessage && <p className="error">{errorMessage}</p>}
      </div>
    </div>
  );
}

export default Register;
