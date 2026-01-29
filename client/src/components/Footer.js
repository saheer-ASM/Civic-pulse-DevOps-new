import React from "react";
import styles from "./Footer.module.css";

const Footer = () => (
  <footer className={styles.footer} id="contact">
    <div>
      &copy; 2025  CivicPulse.  Contact: admin@civicpulse.com | +91-1122334455
    </div>
    <div>  
      <span>Police: police@civicpulse.com | +91-1234567890  </span><br/>
      <span>Water Supply: watersupply@civicpulse.com | +91-1234567891 </span><br/>
      <span>Electricity: electricity@civicpulse.com | +91-1234567892  </span><br/>
      <span>RDA: rda@civicpulse.com | +91-1234567893  </span><br/>
      <span>Urban Council: usc@civicpulse.com | +91-1234567894</span><br/>
    </div>
  </footer>
);

export default Footer;