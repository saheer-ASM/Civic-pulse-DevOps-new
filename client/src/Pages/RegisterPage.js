import React, { useState } from "react";
import styles from "./RegisterPage.module.css";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" }); // render when user input data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // when user types in the input fields, this function updates the form state with the new values
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try 
    {
      await api.post("/auth/register", { ...form, role: "citizen" }); // post funtion to register the user
      alert("Registered successfully!");
      navigate("/login");  // after successful registration navigate to login page here we user useNavigate()
    } 
    
    catch (err) 
    {
      setError(err.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className={styles.registerPage}>
      <form className={styles.registerForm} onSubmit={handleSubmit}>
        <h2>Register as Citizen</h2>
        {error && <div className={styles.error}>{error}</div>}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          autoComplete="username"
        />
        <input
          type="password"
          name="password"
          placeholder="Password (min 6 chars)"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          autoComplete="new-password"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <Footer />
    </div>
  );
};

export default RegisterPage;