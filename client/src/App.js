import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./Pages/HomePage";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import CitizenDashboard from "./Pages/CitizenDashboard";
import AuthorityDashboard from "./Pages/AuthorityDashboard";
import api from "./api"; 

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Try to get user from token (optional: can add a /me endpoint on backend)
    // For now, keep user in state after login/register
  }, []);

  const handleLogout = () => {
    setUser(null); 
    localStorage.removeItem("token"); 
    window.location.href = "/";
  };

  return (
    <Router>
      <Header loggedIn={!!user} userRole={user?.role} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/citizen"
          element={
            user && user.role === "citizen" ? (
              <CitizenDashboard user={user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/authority"
          element={
            user && user.role === "authority" ? (
              <AuthorityDashboard user={user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;