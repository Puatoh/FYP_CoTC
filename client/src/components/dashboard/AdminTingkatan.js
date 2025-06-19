// src/components/dashboard/AdminTingkatan.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/StudentDashboard.module.css'; // Reuse same CSS
import sideBar from '../../sideBar.jpg';
import logoutIcon from '../../logoutIcon.jpg';

const AdminTingkatan = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      // Perform logout action here
      localStorage.removeItem('credentials_admin');
      navigate('/login/admin');
    }
  };

  const handleMenuClick = menuItem => {
     if (menuItem === 'Dashboard') {
      navigate('/dashboard/admin');
    } else if (menuItem === 'Tingkatan') {
      navigate('/tingkatan/admin');
    } else if (menuItem === 'Forum') {
      navigate('/forum/admin');
    } else if (menuItem === 'Latihan') {
      navigate('/latihan/admin');
    }
    setIsSidebarOpen(false);
  };

  const handleTingkatan1Click = () => {
    navigate('/tingkatan-1/admin');
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
              <li>Quiz</li>
            </ul>
          </div>

          {/* Overlay */}
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

      {/* Top right icons */}
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
        <h1>Tingkatan - Admin Mode</h1>
        <p>This is the Tingkatan page for Admin actions.</p>

        {/* Tingkatan Options */}
                <div className={styles.tingkatanOptions}>
                  <div className={styles.tingkatanCell} onClick={handleTingkatan1Click}>Tingkatan 1</div>
                  <div className={styles.tingkatanCell}>Tingkatan 2</div>
                  <div className={styles.tingkatanCell}>Tingkatan 3</div>
                </div>
      </div>
    </div>
  );
};

export default AdminTingkatan;
