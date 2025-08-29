import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

 function NidRegistration() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    father_name: '',
    mother_name: '',
    date_of_birth: '',
    sex: '',
    blood_group: '',
    marital_status: '',
    phone_number: '',
    email: '',
    house: '',
    road: '',
    union_or_ward: '',
    upazila: '',
    district: '',
    division: '',
    post_code: '',
    photo: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, photo: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    
    if (!formData.first_name || !formData.last_name || !formData.date_of_birth || !formData.sex || !formData.post_code) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8081/nid/register', formData);
      setMessage(`NID Registered Successfully! Your NID number is: ${response.data.nid_number}`);
      navigate('/home'); 
      setFormData({
        first_name: '',
        last_name: '',
        father_name: '',
        mother_name: '',
        date_of_birth: '',
        sex: '',
        blood_group: '',
        marital_status: '',
        phone_number: '',
        email: '',
        house: '',
        road: '',
        union_or_ward: '',
        upazila: '',
        district: '',
        division: '',
        post_code: '',
        photo: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className='register-container'>
      <h2>NID Registration</h2>
      {message && <div style={{ color: 'green' }}>{message}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit}>

        <label>First Name*:</label><br />
        <input name="first_name" value={formData.first_name} onChange={handleChange} required /><br />

        <label>Last Name*:</label><br />
        <input name="last_name" value={formData.last_name} onChange={handleChange} required /><br />

        <label>Father Name:</label><br />
        <input name="father_name" value={formData.father_name} onChange={handleChange} /><br />

        <label>Mother Name:</label><br />
        <input name="mother_name" value={formData.mother_name} onChange={handleChange} /><br />

        <label>Date of Birth*:</label><br />
        <input
  type="date"
  name="date_of_birth"
  value={formData.date_of_birth}
  onChange={handleChange}
  required
  max={new Date().toISOString().split("T")[0]} 
  placeholder="YYYY-MM-DD"
/><br />

<label>Gender*:</label><br />
<select name="sex" value={formData.sex} onChange={handleChange} required>
  <option value="">--Select--</option>
  <option value="Male">Male</option>
  <option value="Female">Female</option>
</select><br />

        <label>Blood Group:</label><br />
        <select name="blood_group" value={formData.blood_group} onChange={handleChange}>
          <option value="">--Select--</option>
          <option>A+</option>
          <option>A-</option>
          <option>B+</option>
          <option>B-</option>
          <option>AB+</option>
          <option>AB-</option>
          <option>O+</option>
          <option>O-</option>
        </select><br />

        <label>Marital Status:</label><br />
        <select name="marital_status" value={formData.marital_status} onChange={handleChange}>
          <option value="">--Select--</option>
          <option>Single</option>
          <option>Married</option>
          <option>Divorced</option>
          <option>Widowed</option>
        </select><br />

        <label>Phone Number:</label><br />
        <input name="phone_number" value={formData.phone_number} onChange={handleChange} /><br />

        <label>Email:</label><br />
        <input type="email" name="email" value={formData.email} onChange={handleChange} /><br />

        <label>House:</label><br />
        <input name="house" value={formData.house} onChange={handleChange} /><br />

        <label>Road:</label><br />
        <input name="road" value={formData.road} onChange={handleChange} /><br />

        <label>Union or Ward:</label><br />
        <input name="union_or_ward" value={formData.union_or_ward} onChange={handleChange} /><br />

        <label>Upazila:</label><br />
        <input name="upazila" value={formData.upazila} onChange={handleChange} /><br />

        <label>District:</label><br />
        <input name="district" value={formData.district} onChange={handleChange} /><br />

        <label>Division:</label><br />
        <input name="division" value={formData.division} onChange={handleChange} /><br />

        <label>Post Code*:</label><br />
        <input name="post_code" value={formData.post_code} onChange={handleChange} required maxLength={4} /><br />

        <label>Photo :</label><br />
        <input type="file" accept="image/*" onChange={handlePhotoChange} /><br /><br />

        <button type="submit">Register NID</button>
      </form>
    </div>
  );
}
export default NidRegistration;

