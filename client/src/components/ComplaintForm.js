import React, { useState } from "react";
import styles from "./ComplaintForm.module.css";

const departments = [
  "Police",
  "RDA",
  "SLTB",
  "Water Supply",
  "Urban Council",
];

const ComplaintForm = ({ onSubmit, loading }) => {
  const [form, setForm] = useState({ title: "", description: "", department: departments[0] });  // change 

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.title && form.description && form.department) {
      onSubmit(form);
      setForm({ title: "", description: "", department: departments[0] });
    }
  };

  return (
    <form className={styles.complaintForm} onSubmit={handleSubmit}>
      <h3>Register a Complaint</h3>
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        required
      />
      <select
        name="department"
        value={form.department}
        onChange={handleChange}
        required
      >
        {departments.map((dep) => (
          <option key={dep} value={dep}>
            {dep}
          </option>
        ))}
      </select>
      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Complaint"}
      </button>
    </form>
  );
};

export default ComplaintForm;