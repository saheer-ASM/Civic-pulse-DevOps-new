import React, { useState, useEffect } from "react";
import styles from "./AuthorityDashboard.module.css";
import ComplaintList from "../components/ComplaintList";
import api from "../api";
import Footer from "../components/Footer";

const AuthorityDashboard = ({ user }) => {
  const [complaints, setComplaints] = useState([]); // State to hold complants 
  const [loading, setLoading] = useState(false); // State to manage loadintate

  const fetchComplaints = async () => {
    setLoading(true);
    const res = await api.get("/complaints/authority");
    setComplaints(res.data.reverse());
    setLoading(false);
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    await api.patch(`/complaints/${id}/status`, { status });
    fetchComplaints();
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1>Welcome, {user.name} ({user.department} Department)</h1>
          <p>Manage and resolve complaints assigned to your department.</p>
        </div>
      </header>
      <div className={styles.complaintsListSection}>
        <h3>Department Complaints</h3>
        <ComplaintList
          complaints={complaints}
          userRole="authority"
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
      <Footer />
    </div>
  );
};

export default AuthorityDashboard;