import React from "react";
import styles from "./Header.module.css";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ loggedIn, userRole, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles.logo} onClick={() => navigate("/")}>CivicPulse</div>
        <ul className={styles.navLinks}>
          <li><Link to="/">Home</Link></li>
          <li><a href="#departments">Departments</a></li>
          <li><a href="#contact">Contact</a></li>
          {!loggedIn && (
            <li><Link to="/login">Login</Link></li>
          )}
          {loggedIn && (
            <li>
              <button className={styles.logoutBtn} onClick={() => {
                if (window.confirm("Are you sure you want to logout?")) {
                onLogout();
                }
            }}
            >Logout</button></li>

          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;