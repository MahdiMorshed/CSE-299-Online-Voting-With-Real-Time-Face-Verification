import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './candidate.css';

function Candidate() {
  const location = useLocation();
  const nidNumber = location.state?.nidNumber;

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [modalCandidate, setModalCandidate] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8081/candidate')
      .then(res => {
        setCandidates(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch candidates:', err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = () => {
    if (!selectedId) {
      alert('Please select a candidate.');
      return;
    }

    axios.post('http://localhost:8081/submitVote', { candidateId: selectedId, nid_number: nidNumber })
      .then(res => alert(res.data.message))
      .catch(err => alert(err.response?.data?.error || 'Error submitting vote'));
  };

  const openModal = (candidate) => setModalCandidate(candidate);
  const closeModal = () => setModalCandidate(null);

  if (loading) return <p>Loading candidates...</p>;

  return (
    <div className="candidate-list-container">
      <h2>All Candidates</h2>

      <ul className="candidate-list">
        {candidates.map(candidate => (
          <li
            key={candidate.candidate_id}
            className={`candidate-item ${selectedId === candidate.candidate_id ? 'selected' : ''}`}
            onClick={() => setSelectedId(candidate.candidate_id)}
          >
            <input
              type="radio"
              name="candidate"
              checked={selectedId === candidate.candidate_id}
              onChange={() => setSelectedId(candidate.candidate_id)}
              onClick={e => e.stopPropagation()}
            />
            <img
              src={`http://localhost:8081${candidate.photo_path}`}
              alt={`${candidate.first_name} ${candidate.last_name}`}
              className="candidate-photo"
            />
            <div>
              <div className="candidate-name">
                {candidate.first_name} {candidate.last_name}
              </div>
              <div className="candidate-party">{candidate.political_party}</div>
            </div>
            <button
              className="know-more-btn"
              onClick={e => {
                e.stopPropagation();
                openModal(candidate);
              }}
            >
              Know More
            </button>
          </li>
        ))}
      </ul>

      <button
        className="submit-vote-button"
        onClick={handleSubmit}
        disabled={!selectedId}
      >
        Submit Vote
      </button>

      {modalCandidate && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{modalCandidate.first_name} {modalCandidate.last_name}</h3>
            <img
              src={`http://localhost:8081${modalCandidate.photo_path}`}
              alt={modalCandidate.first_name}
              style={{ width: '150px', borderRadius: '10px' }}
            />
            <p><strong>Party:</strong> {modalCandidate.political_party}</p>
            <p><strong>Occupation:</strong> {modalCandidate.occupation}</p>
            <p><strong>About:</strong> {modalCandidate.about}</p>
            <p><strong>Agenda:</strong> {modalCandidate.agenda}</p>
            <button onClick={closeModal} className="close-modal-btn">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Candidate;
