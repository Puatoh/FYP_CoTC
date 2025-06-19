// src/components/dashboard/AdminT1.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Tingkatan.module.css';

const AdminT1 = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/tingkatan/admin');
  };

  const handleBab1Click = () => {
    navigate('/bab-1/admin');
  };

  return (
    <div className={styles.pageContainer}>
      <button className={styles.backButton} onClick={handleBack}>← Back</button>
      <h1 className={styles.title}>Tingkatan 1 - Admin Mode</h1>

      <div className={styles.babOptions}>
        <div className={styles.babCell} onClick={handleBab1Click}>Bab 1</div>
        <div className={styles.babCell}>Bab 2</div>
        <div className={styles.babCell}>Bab 3</div>
      </div>
    </div>
  );
};

export default AdminT1;
