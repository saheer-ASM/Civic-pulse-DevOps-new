import React from "react";
import styles from "./DepartmentSection.module.css";

const departments = [
  { name: "Police", contact: "police@civicpulse.com | +91-1234567890" },
  { name: "Water Supply", contact: "watersupply@civicpulse.com | +91-1234567891" },
  { name: "Electricity", contact: "electricity@civicpulse.com | +91-1234567892" },
  { name: "RDA", contact: "rda@civicpulse.com | +91-1234567893" },
  { name: "Urban Council", contact: "uc@civicpulse.com | +91-1234567894" },
];

const DepartmentSection = () => (
  <section className={styles.departmentsSection} id="departments">
    <h2>Shaheer A.S.M</h2>
    <div className={styles.departmentsGrid}>
      {departments.map(dep => (
        <div key={dep.name} className={styles.departmentCard}>
          <h3>{dep.name}</h3>
          <p>{dep.contact}</p>
        </div>
      ))}
    </div>
  </section>
);

export default DepartmentSection;