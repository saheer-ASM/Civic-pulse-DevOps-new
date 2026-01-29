import React, { useState } from "react";
import styles from "./LoginPage.module.css";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import Footer from "../components/Footer";

const LoginPage = ({ setUser }) => {
  const [form, setForm] = useState({ email: "", password: "" }); // render when user types in the input fields
  const [loading, setLoading] = useState(false);  // render when the form is being submitted
  const [error, setError] = useState("");  // render when  error occour on login
  const navigate = useNavigate();        // to navigate dashboard after login 

  // when user types in the input fields, this function updates the form state with the new values 
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });  

  const handleSubmit = async (e) => {  // inside the funtion used await 
    e.preventDefault(); // stop the the function from refreshing the page
    setLoading(true);
    setError(""); // clear previous error messages
    try 
    {
      const res = await api.post("/auth/login", form);  // send a POST request to the /auth/login with email and password
      localStorage.setItem("token", res.data.token); // store the returned token for usage 
      setUser(res.data.user);  
      
      
      // check the role of user to vanigate next page
      if (res.data.user.role === "citizen") navigate("/citizen");
      else if (res.data.user.role === "authority") navigate("/authority");
    } 
    catch (err) 
    {
      setError(err.response?.data?.message || "Login failed");  // set the error message to display if login fails
    }
    setLoading(false);
  };

  return (
    <div className={styles.loginPage}>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <div className={styles.error}>{error}</div>}    {/*display error message if any */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}   // when change call the handleChange function
          required
          autoComplete="username"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}  // when change call the handleChange function
          required
          autoComplete="current-password"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}  {/* if loading is true show "Logging in..." otherwise show "Login"*/}
        </button>
        <div className={styles.linkToRegister}>
          Not registered? <Link to="/register">Register as Citizen</Link>
        </div>
      </form>
      <Footer />
    </div>
  );
};

export default LoginPage;