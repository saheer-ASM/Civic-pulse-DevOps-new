import React from "react";
import styles from "./HomePage.module.css";
import DepartmentSection from "../components/DepartmentSection";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();  //  to navigate to different routes programmatically  after login button click
  return (
    <div className={styles.homePage}>          {/*main container for the homepage*/}
      <header className={styles.heroSection}>     {/* hero section with background */}
        <div className={styles.heroContent}> 
          <h1>CivicPulse</h1>
          <p>Report civic issues. Reach the right department efficiently.</p>
          <button className={styles.ctaButton} onClick={() => navigate("/login")}>     {/*after click tha button need to navigate to the login page*/}
            Register a Complaint
          </button>
        </div>
      </header>
      <DepartmentSection />
      <Footer />
    </div>
  );
};

export default HomePage;