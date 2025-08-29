import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './verfy.css';

function VerifyPage() {
  const [nidNumber, setNidNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [retryAllowed, setRetryAllowed] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showFinalWarning, setShowFinalWarning] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (nidNumber.trim() && videoRef.current && !cameraStarted && !showFinalWarning) {
      startCamera();
    }
    if (!nidNumber.trim()) {
      stopCamera();
      setCameraStarted(false);
      setAttemptCount(0);
      setShowFinalWarning(false);
    }
  }, [nidNumber, videoRef.current, showFinalWarning]);

  const startCamera = () => {
    setError('');
    setRetryAllowed(false);
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setCameraStarted(true);
        } else {
          stream.getTracks().forEach(track => track.stop());
          setError('Video element not ready.');
        }
      })
      .catch((err) => {
        setError('Camera access denied: ' + err.message);
      });
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraStarted(false);
  };

  const captureAndVerify = useCallback(async () => {
    if (!nidNumber) return;
    if (attemptCount >= 4) {
      setShowFinalWarning(true);
      stopCamera();
      return;
    }

    setLoading(true);
    setResult(null);
    setError('');
    setRetryAllowed(false);

    try {
      const context = canvasRef.current.getContext('2d');
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      context.drawImage(videoRef.current, 0, 0, 250, 250);

      canvasRef.current.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('nid_number', nidNumber);
        formData.append('webcamImage', blob, 'webcam.jpg');

        try {
          const response = await fetch('http://localhost:8081/vote', {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Unknown error from server');
          }

          setResult(data);

          if (data.match) {
            setShowConfirmation(true);
            stopCamera();
          } else {
            setError('Face not verified. Please try again.');
            setRetryAllowed(true);
            setAttemptCount(prev => prev + 1);
            startCamera();
          }

        } catch (err) {
          setError('Verification failed: ' + err.message);
          setRetryAllowed(true);
          setAttemptCount(prev => prev + 1);
          startCamera();
        } finally {
          setLoading(false);
        }
      }, 'image/jpeg');
    } catch (err) {
      setError('Capture failed: ' + err.message);
      setLoading(false);
      setRetryAllowed(true);
      setAttemptCount(prev => prev + 1);
      startCamera();
    }
  }, [nidNumber, attemptCount]);

  useEffect(() => {
    if (!nidNumber.trim() || !cameraStarted || showConfirmation || loading || showFinalWarning) return;
    if (attemptCount >= 4) return;

    const timer = setTimeout(() => {
      captureAndVerify();
    }, 1500);

    return () => clearTimeout(timer);
  }, [nidNumber, captureAndVerify, showConfirmation, loading, cameraStarted, showFinalWarning, attemptCount]);

  useEffect(() => {
    if (!showFinalWarning) return;

    setError("Verification failed multiple times. Are you sure you typed the right NID and you are the correct person?");
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [showFinalWarning, navigate]);

  const handleConfirmVote = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      navigate('/candidate', { state: { nidNumber } });
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div className="container">
      <h2>Verify Face for Voting</h2>

      {!showConfirmation && !showFinalWarning && (
        <>
          <input
            className="inputText"
            type="text"
            placeholder="Enter your NID number"
            value={nidNumber}
            onChange={(e) => {
              setNidNumber(e.target.value);
              setError('');
              setResult(null);
              setRetryAllowed(false);
              setShowConfirmation(false);
              setAttemptCount(0);
              setShowFinalWarning(false);
            }}
            disabled={loading}
            autoFocus
          />

          <div className="videoWrapper">
            <video ref={videoRef} width="250" height="250" autoPlay muted />
            <canvas ref={canvasRef} width="250" height="250" style={{ display: 'none' }} />
            <div className="overlayBox" />
          </div>

          {loading && (
            <div className="loadingSpinner">
              <div className="spinner" />
              <p>Verifying...</p>
            </div>
          )}

          {error && <p className="errorMessage">{error}</p>}

          {retryAllowed && (
            <button
              className="button retry"
              onClick={() => {
                setError('');
                setResult(null);
                setRetryAllowed(false);
                setAttemptCount(0);
                startCamera();
              }}
            >
              Retry Verification
            </button>
          )}

          {result && !loading && (
            <div className="resultBox">
              <div className="resultScore">
              </div>
              <div>
                {result.match ? (
                  <p className="similar">Face verified.</p>
                ) : (
                  <p className="different">Try Again</p>
                )}
              </div>
              <div>
Maybe you typed the wrong NID number? Please check and try again.
              </div>
            </div>
          )}
        </>
      )}

      {showFinalWarning && (
        <div className="finalWarningBox">
          <p>{error}</p>
          <p>Redirecting to home...</p>
        </div>
      )}

      {showConfirmation && countdown === null && (
        <div className="confirmationBox">
          <h3>You are verified.</h3>
          <p>Are you sure you want to vote?</p>
          <button className="button yes" onClick={handleConfirmVote}>Yes</button>
          <button className="button no" onClick={() => navigate('/')}>No</button>
        </div>
      )}

      {countdown !== null && (
        <div className="countdown">
          <h2>Redirecting in {countdown}...</h2>
        </div>
      )}
    </div>
  );
}

export default VerifyPage;
