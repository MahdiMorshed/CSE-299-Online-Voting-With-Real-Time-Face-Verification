import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./applycandidate.css";

function ApplyCandidate() {
  const location = useLocation();
  const nid_number = location.state?.nid_number;
  const [form, setForm] = useState({
    political_party: "",
    occupation: "",
    about: "",
    agenda: "",
  });
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8081/apply-candidate", {
        nid_number,
        ...form,
      });
      setSuccess("Application submitted successfully!");
    } catch {
      setSuccess("Failed to submit application.");
    }
  };

  return (
    <div className="apply-container">
      <h2>Candidate Application</h2>
      {success && <p className="status-message">{success}</p>}
      <form onSubmit={handleSubmit} className="candidate-form">
        <label>Political Party:</label>
        <select name="political_party" required onChange={handleChange}>
          <option value="">Select</option>
          <option value="BAL">BAL</option>
          <option value="BNP">BNP</option>
          <option value="JI">JI</option>
          <option value="JP">JP</option>
          <option value="IA">IA</option>
          <option value="NCP">NCP</option>
          <option value="INDEPENDENT">INDEPENDENT</option>
        </select>

        <label>Occupation:</label>
        <input type="text" name="occupation" required onChange={handleChange} />

        <label>About Yourself:</label>
        <textarea name="about" required rows={4} onChange={handleChange}></textarea>

        <label>What will you do as MP:</label>
        <textarea name="agenda" required rows={4} onChange={handleChange}></textarea>

        <button type="submit">Submit Application</button>
      </form>
    </div>
  );
}

export default ApplyCandidate;
