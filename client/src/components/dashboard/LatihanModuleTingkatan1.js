// src/components/dashboard/LatihanModuleTingkatan1.js
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase-config';
import axios from 'axios';
import styles from './styles/StudentDashboard.module.css';

const FILTERS = ['All', 'Completed', 'Incomplete'];

const LatihanModuleTingkatan1 = () => {
  const navigate = useNavigate();
  const [modules, setModules]       = useState([]);
  const [statusMap, setStatusMap]   = useState({}); // { [moduleId]: { attempted: bool, lastAttempt: Date } }
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const barRef = useRef(null);

  // Fetch modules & their attempt status
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = await auth.currentUser.getIdToken();
        const [{ data: mods }] = await Promise.all([
          axios.get('/api/modules/tingkatan1', {
            headers: { Authorization: `Bearer ${token}`, email: auth.currentUser.email }
          })
        ]);
        setModules(mods);

        // Fetch attempt status for each module
        const statusEntries = await Promise.all(
          mods.map(async (m) => {
            try {
              const res = await axios.get(
                `/api/attempts/tingkatan1/${m._id}`,
                { headers: { Authorization: `Bearer ${token}`, email: auth.currentUser.email } }
              );
              return [m._id, {
                attempted: true,
                lastAttempt: new Date(res.data.attemptedAt)
              }];
            } catch {
              return [m._id, { attempted: false, lastAttempt: null }];
            }
          })
        );
        setStatusMap(Object.fromEntries(statusEntries));
      } catch (err) {
        console.error(err);
        setError('Could not load modules. Try again later.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Compute filtered list
  const filtered = modules.filter((m) => {
    const { attempted } = statusMap[m._id] || {};
    if (activeFilter === 'Completed' && !attempted) return false;
    if (activeFilter === 'Incomplete' && attempted) return false;
    if (searchTerm && !m.title.toLowerCase().includes(searchTerm.toLowerCase()))
      return false;
    return true;
  });

  const handleModuleClick = (moduleId) =>
    navigate(`/module-latihan-tingkatan-1/${moduleId}`);
  const handleBack = () => navigate('/latihan');

  return (
    <div className={styles.dashboardContainer}>
      <button className={styles.backButton} onClick={handleBack}>
        ← Back
      </button>

      <div className={styles.mainContent}>
        <h1>Latihan Tingkatan 1 Modules</h1>

        {/* ─── Sticky Filter Bar ─────────────────────────────────────────────── */}
        <div
          ref={barRef}
          style={{
            position: 'sticky',
            top: 0,
            background: '#fff',
            padding: '0.5rem 0',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            borderBottom: '1px solid #ddd',
            marginBottom: '1rem'
          }}
        >
          {/* Pills */}
          <div>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  marginRight: '0.5rem',
                  padding: '0.4rem 0.8rem',
                  border: 'none',
                  borderRadius: '999px',
                  background: activeFilter === f ? '#007bff' : '#eee',
                  color: activeFilter === f ? '#fff' : '#333',
                  cursor: 'pointer'
                }}
              >
                {f}
              </button>
            ))}
          </div>
          {/* Search */}
          <input
            type="text"
            placeholder="Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '0.4rem 0.8rem',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        {loading ? (
          <p>Loading modules…</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : filtered.length === 0 ? (
          <p style={{ fontStyle: 'italic' }}>No modules to display.</p>
        ) : (
          filtered.map((mod) => {
            const stat = statusMap[mod._id] || {};
            return (
              <div
                key={mod._id}
                className={styles.forumTopicCard}
                style={{
                  marginBottom: '1rem',
                  cursor: 'pointer',
                  position: 'relative',
                  paddingTop: '1.5rem'
                }}
                onClick={() => handleModuleClick(mod._id)}
              >
                {/* Status Badge */}
                <span
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    background: stat.attempted ? '#28a745' : '#dc3545',
                    color: '#fff',
                    fontSize: '0.75rem'
                  }}
                >
                  {stat.attempted ? 'Completed' : 'Incomplete'}
                </span>

                {/* Title & Description */}
                <h2 style={{ margin: '0 0 0.25rem' }}>{mod.title}</h2>
                <p style={{ margin: '0 0 0.5rem' }}>
                  {mod.description || <em>No description.</em>}
                </p>

                {/* Last-Attempt Timestamp */}
                {stat.attempted && stat.lastAttempt && (
                  <small style={{ color: '#666' }}>
                    Last attempt:{' '}
                    {stat.lastAttempt.toLocaleString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </small>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LatihanModuleTingkatan1;
