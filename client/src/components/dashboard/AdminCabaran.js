// src/components/dashboard/AdminCabaran.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../../firebase-config';
import styles from './styles/StudentDashboard.module.css';
import logoutIcon from '../../logoutIcon.jpg';
import sideBar from '../../sideBar.jpg';

const AdminCabaran = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      setError('');
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error('Tidak diautentikasi');

        const token = await currentUser.getIdToken();
        const res = await axios.get('https://cotc-backend.onrender.com/api/challenges', {
          headers: {
            Authorization: `Bearer ${token}`,
            email: currentUser.email,
          },
        });
        setChallenges(res.data || []);
        setFilteredChallenges(res.data || []);
      } catch (err) {
        console.error('Ralat mendapatkan cabaran:', err);
        setError('Gagal memuatkan cabaran. Sila cuba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const handleMenuClick = menuItem => {
    const routes = {
      Dashboard: '/dashboard/admin',
      Tingkatan: '/tingkatan/admin',
      Forum: '/forum/admin',
      Latihan: '/latihan/admin',
      Cabaran: '/cabaran/admin',
    };
    navigate(routes[menuItem]);
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    if (!window.confirm('Log keluar sekarang?')) return;
    try {
      await auth.signOut();
      localStorage.removeItem('userRole');
      navigate('/login/admin');
    } catch (err) {
      console.error('Ralat log keluar:', err);
    }
  };

  const handleSearch = e => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredChallenges(
      challenges.filter(ch => ch.title.toLowerCase().includes(term))
    );
  };

  const handleCreateChallenge = () => {
    navigate('/cabaran-soalan/admin');
  };

  const handleDeleteChallenge = async (challengeId) => {
  const confirmDelete = window.confirm('Padam cabaran ini? Tindakan ini tidak boleh dibatalkan.');
  if (!confirmDelete) return;

  try {
    const token = await auth.currentUser.getIdToken();
    await axios.delete(`https://cotc-backend.onrender.com/api/challenges/${challengeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        email: auth.currentUser.email,
      },
    });

    const updated = challenges.filter(ch => ch._id !== challengeId);
    setChallenges(updated);
    setFilteredChallenges(updated.filter(ch => ch.title.toLowerCase().includes(searchTerm)));
  } catch (err) {
    console.error('Gagal memadam cabaran:', err);
    alert('Terdapat ralat semasa memadam cabaran.');
  }
};


  return (
    <div className={styles.dashboardContainer}>
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
          src={logoutIcon}
          alt="Logout"
          width={50}
          height={45}
          className={styles.iconClickable}
          onClick={handleLogout}
        />
      </div>

      <div className={styles.mainContent}>
        <h1>Challenges</h1>
        <p>Manage all quizzes or game-based challenges for students.</p>

        <div className={styles.challengeTopControls}>
          <input
            type="text"
            placeholder="Search challenges by title..."
            value={searchTerm}
            onChange={handleSearch}
            className={styles.challengeSearchInput}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: '1px solid #ccc',
              width: '60%',
            }}
          />
          <button
            onClick={handleCreateChallenge}
            className={styles.createChallengeButton}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.2rem',
              cursor: 'pointer',
            }}
          >
            ➕ New Challenge
          </button>
        </div>

        {loading && <p>Loading challenges...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && challenges.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p>No challenges found.</p>
          </div>
        )}

        {!loading && !error && filteredChallenges.length > 0 && (
          <table className={styles.challengeTable}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Questions</th>
                <th>Status</th>
                <th>Created On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChallenges.map(challenge => (
                <tr key={challenge._id}>
                  <td>{challenge.title}</td>
                  <td>{challenge.questions.length}</td>
                  <td>{challenge.status}</td>
                  <td>{new Date(challenge.createdAt).toLocaleDateString('ms-MY')}</td>
                  <td>
                    <button onClick={() => navigate(`/cabaran-soalan/admin?id=${challenge._id}`)} className={styles.actionBtn}>Edit</button>
                    <button onClick={() => navigate(`/cabaran-leaderboard/${challenge._id}`)} className={styles.actionBtn}> Leaderboard </button>
                    <button onClick={() => handleDeleteChallenge(challenge._id)} className={`${styles.actionBtn} ${styles.deleteBtn}`} > Padam</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminCabaran;
