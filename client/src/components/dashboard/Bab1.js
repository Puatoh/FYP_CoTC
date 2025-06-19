// src/components/tingkatan1/Bab1.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './styles/Bab1.module.css'; // Correct CSS path

const Bab1 = () => {
  const navigate = useNavigate();
  const [bab1List, setBab1List] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBab1 = async () => {
      try {
        const res = await axios.get('/api/bab1');
        setBab1List(res.data);
      } catch (err) {
        console.error('Error fetching Bab1 contents:', err);
        setError('Failed to load contents.');
      } finally {
        setLoading(false);
      }
    };

    fetchBab1();
  }, []);

  const handleBack = () => {
    navigate('/tingkatan-1');
  };

  return (
    <div className={styles.container}>
      <button onClick={handleBack} className={styles.backButton}>Back</button>

      <h1>Bab 1 Contents</h1>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <ul className={styles.bab1List}>
          {bab1List.length === 0 ? (
            <p>No Bab 1 contents available.</p>
          ) : (
            bab1List.map(item => (
              <li key={item._id} className={styles.bab1Item}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <a
                  href={item.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.viewButton}
                >
                  View PDF
                </a>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default Bab1;
