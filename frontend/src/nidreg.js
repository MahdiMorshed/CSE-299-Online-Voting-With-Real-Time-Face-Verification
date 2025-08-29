import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './nidreg.css';

function generateBangladeshiNID() {
  const year = new Date().getFullYear().toString().slice(-2); 
  const randomPart = Math.floor(100000000 + Math.random() * 900000000); 
  return `${year}${randomPart}`; 
}

function RegisterNid() {
  const [getvalues, setValues] = useState({
    nid_number: generateBangladeshiNID(),
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

  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setValues(prev => ({ ...prev, photo: files[0] }));
    } else {
      setValues(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const formData = new FormData();
      Object.entries(getvalues).forEach(([key, value]) => {
        formData.append(key, value);
      });

      await axios.post('http://localhost:8081/nid', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate('/login');
    } catch (error) {
      console.error(error);
      setErrorMessage('Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <h2>NID Registration</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>
          First Name:
          <input type="text" name="first_name" value={getvalues.first_name} onChange={handleChange} required />
        </label>

        <label>
          Last Name:
          <input type="text" name="last_name" value={getvalues.last_name} onChange={handleChange} required />
        </label>

        <label>
          Father's Name:
          <input type="text" name="father_name" value={getvalues.father_name} onChange={handleChange} required />
        </label>

        <label>
          Mother's Name:
          <input type="text" name="mother_name" value={getvalues.mother_name} onChange={handleChange} required />
        </label>

        <label>
          Date of Birth:
          <input type="date" name="date_of_birth" value={getvalues.date_of_birth} onChange={handleChange} required />
        </label>

        <label>
          Sex:
          <select name="sex" value={getvalues.sex} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label>
          Blood Group:
          <select name="blood_group" value={getvalues.blood_group} onChange={handleChange}>
            <option value="">Select</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </label>

        <label>
          Marital Status:
          <select name="marital_status" value={getvalues.marital_status} onChange={handleChange}>
            <option value="">Select</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </label>

        <label>
          Phone Number:
          <input type="text" name="phone_number" value={getvalues.phone_number} onChange={handleChange} required />
        </label>

        <label>
          Email:
          <input type="email" name="email" value={getvalues.email} onChange={handleChange} required />
        </label>

        <label>
          House:
          <input type="text" name="house" value={getvalues.house} onChange={handleChange} required />
        </label>

        <label>
          Road:
          <input type="text" name="road" value={getvalues.road} onChange={handleChange} required />
        </label>

        <label>
          Union or Ward:
          <input type="text" name="union_or_ward" value={getvalues.union_or_ward} onChange={handleChange} required />
        </label>

        <label>
          Upazila:
          <input type="text" name="upazila" value={getvalues.upazila} onChange={handleChange} required />
        </label>

        <label>
          District:
          <input type="text" name="district" value={getvalues.district} onChange={handleChange} required />
        </label>

        <label>
          Division:
          <input type="text" name="division" value={getvalues.division} onChange={handleChange} required />
        </label>

        <label>
          Post Code:
          <input type="text" name="post_code" value={getvalues.post_code} onChange={handleChange} required />
        </label>

        <label>
          Photo:
          <input type="file" name="photo" accept="image/*" onChange={handleChange} />
        </label>

        <button type="submit">Register</button>
      </form>

      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
}

export default RegisterNid;
