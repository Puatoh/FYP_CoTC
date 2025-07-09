import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../../firebase-config';
import styles from './styles/StudentDashboard.module.css';

const ChallengeLeaderboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('userRole') || '';
    setUserRole(role);

    const fetchLeaderboard = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const token = await currentUser.getIdToken();

        const [challengeRes, leaderboardRes] = await Promise.all([
          axios.get(`https://cotc-backend.onrender.com/api/challenges/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              email: currentUser.email,
            },
          }),
          axios.get(`https://cotc-backend.onrender.com/api/challenges/${id}/leaderboard`, {
            headers: {
              Authorization: `Bearer ${token}`,
              email: currentUser.email,
            },
          }),
        ]);

        setChallengeTitle(challengeRes.data.title);
        setAttempts(leaderboardRes.data);
      } catch (err) {
        console.error(err);
        setError('Gagal memuatkan leaderboard.');
      }
    };

    fetchLeaderboard();
  }, [id]);


  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('ms-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.dashboardContainer}>
      <button
        className={styles.backButton}
        onClick={() =>
          userRole === 'admin' ? navigate('/cabaran/admin') : navigate('/cabaran')
        }
      >
        ← Kembali
      </button>
      <h2>Leaderboard: {challengeTitle}</h2>

      {error && <p className={styles.profileError}>{error}</p>}

      {attempts.length === 0 ? (
        <p>Tiada penyertaan lagi.</p>
      ) : (
        <table className={styles.achievementTable}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Pelajar</th>
              <th>Markah</th>
              <th>Jawapan Betul</th>
              <th>Masa Hantar</th>
              <th>Masa Diambil</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((a) => (
              <tr key={a.rank}>
                <td>{a.rank}</td>
                <td>{a.studentName}</td>
                <td>{a.totalPoints}</td>
                <td>{a.correctCount}</td>
                <td>{formatDate(a.submittedAt)}</td>
                <td>{a.timeTaken}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ChallengeLeaderboard;
