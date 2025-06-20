// src/components/dashboard/Forum.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase-config';
import sideBar from '../../sideBar.jpg';
import logoutIcon from '../../logoutIcon.jpg';
import styles from './styles/StudentDashboard.module.css'; // same CSS module

const Forum = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (!confirmLogout) return;
    try {
      await signOut(auth);
      localStorage.removeItem('userRole');
      navigate('/login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const handleMenuClick = (menuItem) => {
    if (menuItem === 'Dashboard') {
      navigate('/dashboard');
    } else if (menuItem === 'Tingkatan') {
      navigate('/tingkatan');
    } else if (menuItem === 'Forum') {
      navigate('/forum');
    } else if (menuItem === 'Latihan') {
      navigate('/latihan');
    }else if (menuItem === 'Cabaran') {
      navigate('/cabaran');
    }
    setIsSidebarOpen(false);
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      {isSidebarOpen && (
        <>
          <div className={styles.sidebar}>
            <div className={styles.closeSidebar} onClick={toggleSidebar}>←</div>
            <h3 className={styles.sidebarTitle}>Dashboard Menu</h3>
            <ul className={styles.sidebarList}>
              <li onClick={() => handleMenuClick('Dashboard')}>Dashboard</li>
              <li onClick={() => handleMenuClick('Tingkatan')}>Tingkatan</li>
              <li onClick={() => handleMenuClick('Forum')}>Forum</li>
              <li onClick={() => handleMenuClick('Latihan')}>Latihan</li>
              <li onClick={() => handleMenuClick('Cabaran')}>Cabaran</li>
            </ul>
          </div>
          <div className={styles.overlay} onClick={toggleSidebar} />
        </>
      )}

      {/* Sidebar toggle button */}
      {!isSidebarOpen && (
        <div className={styles.sidebarButton}>
          <img
            src={sideBar}
            alt="Sidebar"
            width={45}
            height={45}
            className={styles.iconClickable}
            onClick={toggleSidebar}
          />
        </div>
      )}

      {/* Top-right logout icon */}
      <div className={styles.topRightIcons}>
        <img
          src={logoutIcon}
          alt="Logout"
          width={50}
          height={45}
          className={styles.iconClickable}
          onClick={handleLogout}
        />
      </div>

      {/* Main content */}
      <div className={styles.mainContent}>
        <h1>Forum </h1>
        <p>This is the Forum page for Discussion.</p>

        {/* Clicking this cell → /forum-tingkatan-1 */}
        <div
          className={styles.tingkatanCell}
          onClick={() => navigate('/forum-tingkatan-1')}
        >
          Tingkatan 1
        </div>
      </div>
    </div>
  );
};

export default Forum;
