import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";

const Dashboard = () => {
  const [remainingScans, setRemainingScans] = useState(0);
  const [structuredData, setStructuredData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [scannedDocs, setScannedDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPrevScans, setShowPrevScans] = useState(false);
  const [showCamera, setShowCamera] = useState(false); // State to toggle camera
  const webcamRef = useRef(null); // Ref for the webcam
  const navigate = useNavigate(); // Hook to navigate between routes

  useEffect(() => {
    const fetchScannedDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          return navigate('/login');
        }

        // Fetch remaining scans
        const remainingScansResponse = await fetch("http://localhost:5000/check-scans", {
          method: "GET",
          headers: { Authorization: token },
        });

        const remainingScansData = await remainingScansResponse.json();
        if (remainingScansResponse.ok) {
          setRemainingScans(remainingScansData.remainingScans || 0);
        } else {
          setErrorMessage(remainingScansData.error || "Failed to fetch remaining scans");
        }

        // Fetch scanned documents
        const scannedDocsResponse = await fetch("http://localhost:5000/getScannedDetail", {
          method: "GET",
          headers: { Authorization: token },
        });

        const scannedDocsData = await scannedDocsResponse.json();
        if (scannedDocsResponse.ok) {
          setScannedDocs(scannedDocsData.scannedDocs);
        } else {
          setErrorMessage(scannedDocsData.error || "Failed to fetch scanned documents");
        }
      } catch (error) {
        console.error("Error fetching details:", error);
        setErrorMessage("Error fetching details.");
      }
    };

    fetchScannedDetails();
  }, [navigate]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setErrorMessage("");
  };

  const handleScan = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setErrorMessage("");

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/scan", {
        method: "POST",
        headers: { Authorization: token },
        body: formData,
      });

      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (response.ok) {
        setSuccessMessage("Document scanned successfully!");
        setStructuredData(responseData.data || {});
        setRemainingScans(responseData.remainingScans || 0);

        // Add new scanned document at the top
        setScannedDocs((prevDocs) => [
          {
            pdf_name: file.name || "Camera Capture",
            extracted_json: responseData.data,
            createdAt: new Date().toISOString(),
          },
          ...prevDocs,
        ]);
      } else {
        setErrorMessage(responseData.error || "Error scanning document");
      }
    } catch (error) {
      console.error("Error in scan process:", error);
      setErrorMessage("Error scanning document.");
    } finally {
      setLoading(false);
    }
  };

  const handleCameraCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      // Convert the image to a file
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "camera_capture.png", { type: "image/png" });
          setSelectedFile(file);
          handleScan(file);
        });
    }
  };

  // Reset the scan process
  const resetScan = () => {
    setStructuredData(null);
    setSelectedFile(null);
    setSuccessMessage("");
    setErrorMessage("");
    setShowCamera(false); // Close the camera if open
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1 className="card-title">Document Scanner Dashboard</h1>
        <div className="scan-counter">Remaining Scans: {remainingScans}</div>

        {/* Button to show/hide previous scans */}
        <button
          onClick={() => setShowPrevScans(!showPrevScans)}
          className="btn btn-secondary prev-scans-btn"
        >
          {showPrevScans ? "Hide Previous Scans" : "Previous Scanned Copies"}
        </button>
      </div>

      <div className="card">
        <h2>Scan Document</h2>

        {errorMessage && <div className="notification notification-error">{errorMessage}</div>}
        {successMessage && <div className="notification notification-success">{successMessage}</div>}

        <div className="form-group">
          <label className="form-label">Upload Document</label>
          <div className="file-input">
            <input
              type="file"
              id="document-upload"
              onChange={handleFileChange}
              className="form-input"
              style={{ display: "none" }}
            />
            <label htmlFor="document-upload" className="file-input-label">
              {selectedFile ? selectedFile.name : "Choose a file or drag it here"}
            </label>
          </div>
        </div>

        {/* Camera Option */}
        <button
          onClick={() => setShowCamera(!showCamera)}
          className="btn btn-secondary"
        >
          {showCamera ? "Close Camera" : "Scan Using Camera"}
        </button>

        {showCamera && (
          <div className="camera-section">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/png"
              width="100%"
              height="auto"
            />
            <button
              onClick={handleCameraCapture}
              className="btn btn-primary"
            >
              Capture Image
            </button>
          </div>
        )}

        <button
          onClick={() => handleScan(selectedFile)}
          disabled={loading || !selectedFile || remainingScans <= 0}
          className={`btn btn-primary ${loading ? "btn-loading" : ""}`}
        >
          {loading ? "Scanning..." : "Scan Document"}
        </button>

        {/* Reset Scan Button */}
        {structuredData && (
          <button
            onClick={resetScan}
            className="btn btn-reset"
          >
            Reset Scan
          </button>
        )}
      </div>

      {/* Show extracted data immediately below scan section */}
      {structuredData && (
        <div className="card">
          <h2>Scanned Document Data</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(structuredData).map(([key, value], index) => (
                <tr key={index}>
                  <td>{key}</td>
                  <td>{JSON.stringify(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Previous Scans Modal */}
      {showPrevScans && (
        <div className="modal">
          <div className="modal-content">
            <button onClick={() => setShowPrevScans(false)} className="close-btn">
              &times;
            </button>
            <h2 className="card-title">Previously Scanned Documents</h2>
            {scannedDocs.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PDF Name</th>
                    <th>Extracted Data</th>
                    <th>Date Scanned</th>
                  </tr>
                </thead>
                <tbody>
                  {scannedDocs.map((doc, index) => (
                    <tr key={index}>
                      <td>{doc.pdf_name}</td>
                      <td>
                        <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                          {JSON.stringify(doc.extracted_json, null, 2)}
                        </pre>
                      </td>
                      <td>{new Date(doc.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No previously scanned documents found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;