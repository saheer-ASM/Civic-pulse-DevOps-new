import React, { useState, useEffect } from "react";
import styles from "./CitizenDashboard.module.css";
import DepartmentSection from "../components/DepartmentSection";
import ComplaintForm from "../components/ComplaintForm";
import ComplaintList from "../components/ComplaintList";
import api from "../api";
import Footer from "../components/Footer";

const CitizenDashboard = ({ user }) => { 
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    const res = await api.get("/complaints/my-complaints");
    setComplaints(res.data.reverse());
    setLoading(false);
  };

  useEffect(() => { // useEffect to fetch complaints when the component mounts
    fetchComplaints();
  }, []); // only run when refresh the page

  const handleComplaintSubmit = async (data) => {
    setLoading(true);
    await api.post("/complaints/create", data);
    fetchComplaints();
    setLoading(false);
  };

  const handleComment = async (id, message) => {
    await api.post(`/complaints/${id}/comment`, { message });
    fetchComplaints();
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1>Welcome, {user.name}!</h1>
          <p>Raise your civic issues and track their resolution.</p>
          <a href="#complaintForm" className={styles.ctaButton}>Register a Complaint</a>
        </div>
      </header>
      <DepartmentSection />
      <div id="complaintForm">
        <ComplaintForm onSubmit={handleComplaintSubmit} loading={loading} />
      </div>
      <div className={styles.complaintsListSection}>
        <h3>Your Complaints</h3>
        <ComplaintList complaints={complaints} userRole="citizen" onComment={handleComment} />
      </div>
      <Footer />
    </div>
  );
};

export default CitizenDashboard;