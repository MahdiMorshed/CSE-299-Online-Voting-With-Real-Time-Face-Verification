import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./admin.css";

const Admin = () => {
  const [step, setStep] = useState("send");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const [nidData, setNidData] = useState([]);
  const [selectedNid, setSelectedNid] = useState(null);

  const [candidateApps, setCandidateApps] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const sentOtpRef = useRef(false);

  useEffect(() => {
    if (sentOtpRef.current) return;
    sentOtpRef.current = true;

    const sendOTP = async () => {
      try {
        const res = await axios.post("http://localhost:8081/api/admin/send-otp", {
          email: "mahdimorshedasif01@gmail.com",
        });
        setMessage(res.data.message);
        setStep("verify");
      } catch (err) {
        setMessage("Error sending OTP");
      }
    };

    sendOTP();
  }, []);

  const verifyOTP = async () => {
    try {
      const res = await axios.post("http://localhost:8081/api/admin/verify-otp", { otp });
      if (res.data.success) {
        setMessage("Access granted.");
        setStep("admin-panel");
      } else {
        setMessage("Invalid OTP");
      }
    } catch (err) {
      setMessage("Verification failed");
    }
  };

  const grantNidRequest = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/admin/nid-requests");
      setNidData(res.data);
      setStep("nid-list");
      setMessage("");
    } catch (err) {
      setMessage("Failed to fetch NID requests");
    }
  };

  const selectNidProfile = (nid) => {
    setSelectedNid(nid);
    setStep("nid-profile");
  };

  const backToList = () => {
    setSelectedNid(null);
    setStep("nid-list");
  };

  const grantNidProfile = async () => {
    try {
      const res = await axios.post("http://localhost:8081/api/admin/grant-nid", {
        nid_number: selectedNid.nid_number,
      });

      setMessage(res.data.message);
      setSelectedNid(null);
      setStep("nid-list");

      const refresh = await axios.get("http://localhost:8081/api/admin/nid-requests");
      setNidData(refresh.data);
    } catch (err) {
      setMessage("Failed to grant NID.");
    }
  };

  const grantCandidateRequest = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/admin/candidate-requests");
      setCandidateApps(res.data);
      setStep("candidate-list");
      setMessage("");
    } catch (err) {
      setMessage("Failed to fetch candidate applications");
    }
  };

  const selectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setStep("candidate-profile");
  };

  const backToCandidateList = () => {
    setSelectedCandidate(null);
    setStep("candidate-list");
  };

  const grantCandidate = async () => {
    try {
      const res = await axios.post("http://localhost:8081/api/admin/grant-candidate", {
        nid_number: selectedCandidate.nid_number,
      });
      setMessage(res.data.message);
      setSelectedCandidate(null);

      const refresh = await axios.get("http://localhost:8081/api/admin/candidate-requests");
      setCandidateApps(refresh.data);
      setStep("candidate-list");
    } catch (err) {
      setMessage("Failed to grant candidate.");
    }
  };

  return (
    <div className="admin-container">
      <h2>Admin Portal</h2>

      {step === "verify" && (
        <>
          <p>OTP sent to Admin email. Enter it below:</p>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <br />
          <button onClick={verifyOTP}>Verify OTP</button>
        </>
      )}

      {step === "admin-panel" && (
        <>
          <p>Welcome, Admin! Choose an action:</p>
          <button className="grant-nid-btn" onClick={grantNidRequest}>
            Grant NID Request
          </button>
          <button className="grant-candidate-btn" onClick={grantCandidateRequest}>
            Grant Candidate Request
          </button>
        </>
      )}

      {step === "nid-list" && (
        <>
          <h3>NID Requests</h3>
          {nidData.length === 0 ? (
            <p>No NID requests found.</p>
          ) : (
            <ul className="nid-list">
              {nidData.map((nid) => (
                <li
                  key={nid.nid_number}
                  className="nid-list-item"
                  onClick={() => selectNidProfile(nid)}
                >
                  {nid.first_name} {nid.last_name}
                </li>
              ))}
            </ul>
          )}
          <br />
          <button onClick={() => setStep("admin-panel")}>Back to Admin Panel</button>
        </>
      )}

      {step === "nid-profile" && selectedNid && (
        <>
          <button onClick={backToList} className="back-btn">
            ← Back to List
          </button>
          <div className="nid-profile-card">
            <div className="nid-photo-container">
              {selectedNid.photo_path ? (
                <img
                  src={`http://localhost:8081${selectedNid.photo_path}`}
                  alt="NID"
                  className="nid-photo"
                />
              ) : (
                <div className="no-photo">No Photo</div>
              )}
            </div>
            <div className="nid-details">
              <h3>
                {selectedNid.first_name} {selectedNid.last_name}
              </h3>
              <p>
                <b>NID Number:</b> {selectedNid.nid_number}
              </p>
              <p>
                <b>Father's Name:</b> {selectedNid.father_name}
              </p>
              <p>
                <b>Mother's Name:</b> {selectedNid.mother_name}
              </p>
              <p>
                <b>Date of Birth:</b> {selectedNid.date_of_birth}
              </p>
              <p>
                <b>Sex:</b> {selectedNid.sex}
              </p>
              <p>
                <b>Blood Group:</b> {selectedNid.blood_group}
              </p>
              <p>
                <b>Marital Status:</b> {selectedNid.marital_status}
              </p>
              <p>
                <b>Phone Number:</b> {selectedNid.phone_number}
              </p>
              <p>
                <b>Email:</b> {selectedNid.email}
              </p>
              <p>
                <b>Address:</b>
              </p>
              <p className="address">
                {selectedNid.house}, {selectedNid.road},<br />
                {selectedNid.union_or_ward}, {selectedNid.upazila},<br />
                {selectedNid.district}, {selectedNid.division} - {selectedNid.post_code}
              </p>
            </div>
          </div>
          <button className="grant-nid-btn" onClick={grantNidProfile}>
            Grant NID
          </button>
        </>
      )}

{step === "candidate-list" && (
  <>
    <h3>Candidate Applications</h3>
    {candidateApps.length === 0 ? (
      <p>No candidate applications found.</p>
    ) : (
      <ul className="candidate-list">
        {candidateApps.map((candidate) => (
          <li
            key={candidate.nid_number}
            className="candidate-list-item"
            onClick={() => selectCandidate(candidate)}
          >
            {candidate.name} - {candidate.political_party}
          </li>
        ))}
      </ul>
    )}
    <br />
    <button onClick={() => setStep("admin-panel")}>Back to Admin Panel</button>
  </>
)}

{step === "candidate-profile" && selectedCandidate && (
  <>
    <button onClick={backToCandidateList} className="back-btn">
       Back to List
    </button>

    <div className="candidate-profile-card">
      {selectedCandidate.photo && (
        <div className="nid-photo-container">
          <img
            src={`http://localhost:8081${selectedCandidate.photo}`}
            alt="NID"
            className="nid-photo"
          />
        </div>
      )}

      <h3>Candidate Application</h3>

      <p>
        <b>Name:</b> {selectedCandidate.name}
      </p>
      <p>
        <b>Email:</b> {selectedCandidate.email}
      </p>
      <p>
        <b>Address:</b> {selectedCandidate.address}
      </p>

      <p>
        <b>NID Number:</b> {selectedCandidate.nid_number}
      </p>
      <p>
        <b>Political Party:</b> {selectedCandidate.political_party}
      </p>
      <p>
        <b>Occupation:</b> {selectedCandidate.occupation}
      </p>
      <p>
        <b>About:</b> {selectedCandidate.about}
      </p>
      <p>
        <b>Agenda:</b> {selectedCandidate.agenda}
      </p>

      <button className="grant-candidate-btn" onClick={grantCandidate}>
       Grant Candidate
      </button>
    </div>
  </>
)}

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Admin;
