import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import './profile.css';


function Profile() {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  const nid_number = location.state?.nid_number;

  useEffect(() => {
    if (!nid_number) {
      navigate("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:8081/profile?nid_number=${nid_number}`);
        if (res.data) {
          setProfile(res.data);
        } else {
          setError("No profile found.");
        }
      } catch {
        setError("Failed to fetch profile.");
      }
    };

    fetchProfile();
  }, [nid_number, navigate]);

  const handleLogout = () => {
    navigate("/home");
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="profile-section">
          <img
            src={profile?.photo_path ? `http://localhost:8081${profile.photo_path}` : "/profile-icon.png"}
            alt="Profile"
            className="profile-pic"
          />
          <h3>{profile ? `${profile.first_name} ${profile.last_name}` : "Loading..."}</h3>
          <p>Logged in</p>
        </div>
        <nav>
          <ul>
            <li>
              <button className="sidebar-btn" onClick={() => setShowProfile(false)}>
                Dashboard
              </button>
            </li>
            <li>
              <button className="sidebar-btn" onClick={() => setShowProfile(true)}>
                Profile Info
              </button>
            </li>
            <li>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header className="header">
          <h1>Welcome, {profile ? `${profile.first_name}` : "User"} </h1>
        </header>

        {!showProfile && (
          <div className="card-grid">
            <div className="glass-card">
              <h3>Edit Information</h3>
              <p>Update your profile details easily.</p>
              <button className="glass-button" onClick={() => alert("Edit Information button clicked")}>
                Edit Information
              </button>
            </div>

            <div className="glass-card">
              <h3>Apply for Driving License</h3>
              <p>Start your driving license application online.</p>
              <button className="glass-button" onClick={() => alert("Apply for Driving License button clicked")}>
                Apply Now
              </button>
            </div>

            <div className="glass-card">
              <h3>Apply for Candidateship</h3>
              <p>Submit your application for upcoming elections.</p>
              <button
                className="glass-button"
                onClick={() => navigate("/applycandidate", { state: { nid_number: profile?.nid_number } })}
                disabled={!profile}
              >
                Apply Now
              </button>
            </div>
          </div>
        )}

        {showProfile && profile && (
          <div className="profile-card">
            <div className="profile-photo">
              {profile.photo_path && (
                <img
                  src={`http://localhost:8081${profile.photo_path}`}
                  alt={`${profile.first_name} ${profile.last_name}`}
                />
              )}
            </div>
            <div className="profile-info">
              <div><strong>Name:</strong> {profile.first_name} {profile.last_name}</div>
              <div><strong>NID:</strong> {profile.nid_number}</div>
              <div><strong>Father's Name:</strong> {profile.father_name}</div>
              <div><strong>Mother's Name:</strong> {profile.mother_name}</div>
              <div><strong>DOB:</strong> {profile.date_of_birth}</div>
              <div><strong>Blood Group:</strong> {profile.blood_group}</div>
              <div><strong>Sex:</strong> {profile.sex}</div>
              <div><strong>Marital Status:</strong> {profile.marital_status}</div>
              <div><strong>Phone:</strong> {profile.phone_number}</div>
              <div><strong>Email:</strong> {profile.email}</div>
              <div>
                <strong>Address:</strong> {profile.house}, {profile.road}, {profile.union_or_ward}, {profile.upazila}, {profile.district}, {profile.division}, {profile.post_code}
              </div>
            </div>
          </div>
        )}

        {error && <p className="profile-error">{error}</p>}
      </main>
    </div>
  );
}

export default Profile;
