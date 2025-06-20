import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { auth } from '../../firebase-config';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import trophyIcon from '../../trophyIcon.jpg';
import logoutIcon from '../../logoutIcon.jpg';
import sideBar from '../../sideBar.jpg';
import styles from './styles/StudentDashboard.module.css';

const Cabaran = () => {
  const [challenges, setChallenges] = useState([]);
  const [filter, setFilter] = useState('Semua');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await axios.get('/api/challenges', {
          headers: {
            Authorization: `Bearer ${token}`,
            email: auth.currentUser.email,
          },
        });
        setChallenges(res.data || []);
      } catch (err) {
        console.error('Gagal memuatkan cabaran:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  const filteredChallenges = challenges.filter(c => {
    if (filter === 'Semua') return true;
    return c.status === filter;
  });

  const openChallengeModal = ch => {
    setSelectedChallenge(ch);
  };

  const closeModal = () => setSelectedChallenge(null);

  const handleEnroll = () => {
    navigate(`/cabaran-soalan/${selectedChallenge._id}`);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
    }
  };

  const handleMenuClick = (menuItem) => {
    if (menuItem === 'Dashboard') navigate('/dashboard');
    else if (menuItem === 'Tingkatan') navigate('/tingkatan');
    else if (menuItem === 'Forum') navigate('/forum');
    else if (menuItem === 'Latihan') navigate('/latihan');
    else if (menuItem === 'Cabaran') navigate('/cabaran');
    setIsSidebarOpen(false);
  };

  const handleShowAchievements = () => {
    if (!isSidebarOpen) {
      setShowAchievements(true);
    }
  };

  const handleCloseAchievements = () => setShowAchievements(false);

  return (
    <div className={styles.dashboardContainer}>
      {/* ─── Sidebar ─── */}
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
              <li>Cabaran</li>
            </ul>
          </div>
          <div className={styles.overlay} onClick={toggleSidebar} />
        </>
      )}

      {/* ─── Top-right icons ─── */}
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

      {/* ─── Main Content ─── */}
      <div className={styles.mainContent}>
        <h2>Cabaran</h2>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          {['Semua', 'Aktif', 'Ditutup'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={filter === f ? styles.profileSaveButton : styles.profileCancelButton}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <p>Sedang memuatkan...</p>
        ) : (
          <div className={styles.challengeGrid}>
            {filteredChallenges.map(ch => (
              <div key={ch._id} className={styles.challengeCard}>
                <div className={styles.challengeTitle}>{ch.title}</div>
                <div>Status: <span className={ch.status === 'Aktif' ? styles.statusActive : styles.statusClosed}>{ch.status}</span></div>
                <div>Dicipta: {new Date(ch.createdAt).toLocaleDateString('ms-MY')}</div>
                <div className={styles.leaderboardPreview}>
                  <strong>🏆 Leaderboard:</strong>
                  <ul>
                    {ch.leaderboard?.slice(0, 3).map((lb, i) => (
                      <li key={i}>{lb.name}: {lb.score}</li>
                    ))}
                  </ul>
                  <button className={styles.smallButton} onClick={() => navigate(`/cabaran-leaderboard/${ch._id}`)}>Lihat Penuh</button>
                </div>
                <button className={styles.profileSaveButton} onClick={() => openChallengeModal(ch)}>
                  Sertai / Lihat
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Challenge Modal ─── */}
      {selectedChallenge && (
        <>
          <div className={styles.popupOverlay} onClick={closeModal} />
          <div className={styles.popupBox}>
            <h3>{selectedChallenge.title}</h3>
            <p><strong>Deskripsi:</strong> {selectedChallenge.description}</p>
            <p><strong>Peraturan:</strong> {selectedChallenge.rules}</p>
            <p><strong>Durasi:</strong> {selectedChallenge.duration} minit</p>
            <p><strong>Soalan:</strong> {selectedChallenge.questions.length}</p>
            <div style={{ marginTop: '1rem' }}>
              <button onClick={handleEnroll} className={styles.profileSaveButton}>✅ Sertai Cabaran</button>
              <button onClick={closeModal} className={styles.profileCancelButton}>❌ Batal</button>
            </div>
          </div>
        </>
      )}

      {/* ─── Achievements Modal ─── */}
      {showAchievements && (
        <>
          <div className={styles.popupOverlay} onClick={handleCloseAchievements} />
          <div className={styles.popupBox}>
            <h2>Achievements</h2>
            <button onClick={handleCloseAchievements} className={styles.closeButton}>✖</button>

            <table className={styles.achievementTable}>
              <thead>
                <tr>
                  <th>Competition Name</th>
                  <th>Date Joined</th>
                  <th>Rank</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="3" className={styles.noRecord}>
                    No Record Found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Cabaran;
