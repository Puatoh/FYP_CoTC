// src/components/dashboard/Tingkatan.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase-config';
import trophyIcon from '../../trophyIcon.jpg';
import logoutIcon from '../../logoutIcon.jpg';
import sideBar from '../../sideBar.jpg';
import styles from './styles/StudentDashboard.module.css'; // Reuse same CSS

const Tingkatan = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievements, setAchievements] = useState([]);

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      try {
        await signOut(auth);
        localStorage.removeItem('credentials_student');
        navigate('/login');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    } else {
      navigate('/tingkatan');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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

  const handleShowAchievements = () => {
    if (!isSidebarOpen) {
      fetchAchievements();
      setShowAchievements(true);
    }
  };

  const handleCloseAchievements = () => {
    setShowAchievements(false);
  };

  const fetchAchievements = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error("User not logged in");
      navigate("/login");
      return;
    }

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/challenge-attempts/student/achievements", {
        headers: {
          Authorization: `Bearer ${token}`,
          email: user.email,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch achievements");
      const data = await res.json();
      setAchievements(data);
    } catch (err) {
      console.error("Error loading achievements:", err);
    }
  };

  const handleTingkatan1Click = () => {
    navigate('/tingkatan-1');
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

      {/* Sidebar toggle */}
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
          src={trophyIcon}
          alt="Achievements"
          width={45}
          height={45}
          className={`${styles.iconClickable} ${isSidebarOpen ? styles.disabledIcon : ''}`}
          onClick={handleShowAchievements}
        />
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
        <h1>Tingkatan</h1>

        {/* Tingkatan Options */}
        <div className={styles.tingkatanOptions}>
          <div className={styles.tingkatanCell} onClick={handleTingkatan1Click}>Tingkatan 1</div>
          <div className={styles.tingkatanCell}>Tingkatan 2</div>
          <div className={styles.tingkatanCell}>Tingkatan 3</div>
        </div>
      </div>

      {/* Achievements Popup */}
      {showAchievements && (
        <>
          <div className={styles.popupOverlay} onClick={handleCloseAchievements} />
          <div className={styles.popupBox}>
            <h2>Pencapaian</h2>
            <button onClick={handleCloseAchievements} className={styles.closeButton}>✖</button>

            <table className={styles.achievementTable}>
              <thead>
                <tr>
                  <th>Nama Pertandingan</th>
                    <th>Tarikh Sertai</th>
                    <th>Kedudukan</th>
                </tr>
              </thead>
              <tbody>
                {achievements.length === 0 ? (
                  <tr>
                    <td colSpan="3" className={styles.noRecord}>Tiada Rekod Ditemui</td>
                  </tr>
                ) : (
                  achievements.map((ach, index) => (
                    <tr key={index}>
                      <td>{ach.title}</td>
                      <td>{new Date(ach.date).toLocaleDateString('ms-MY')}</td>
                      <td>{ach.rank}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Tingkatan;
