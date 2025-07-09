// src/components/dashboard/AdminBab1.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './styles/AdminBab1.module.css';
import { auth } from '../../firebase-config';
import { getIdToken } from 'firebase/auth';

const AdminBab1 = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bab1List, setBab1List] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentBab1, setCurrentBab1] = useState(null);

  const fetchBab1List = async () => {
    try {
      const res = await axios.get('/api/bab1');
      setBab1List(res.data);
    } catch (err) {
      console.error('Ralat memuatkan Bab1:', err);
    }
  };

  useEffect(() => {
    fetchBab1List();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 100 * 1024 * 1024) {
      alert('Saiz fail mesti di bawah 100MB.');
      e.target.value = null;
      return;
    }
    setFile(selectedFile);
    setError('');
  };

  const handleUpload = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!editMode && !file) {
      setError('Sila pilih fail PDF.');
      return;
    }

    if (!trimmedTitle || !trimmedDescription) {
      setError('Tajuk dan Penerangan tidak boleh kosong.');
      return;
    }

    if (trimmedTitle.length > 50 || trimmedDescription.length > 50) {
      setError('Tajuk dan Penerangan mesti kurang daripada 50 patah perkataan.');
      return;
    }

    try {
      setIsUploading(true);
      const token = await getIdToken(auth.currentUser);

      const formData = new FormData();
      if (file) formData.append('pdf', file);
      formData.append('title', trimmedTitle);
      formData.append('description', trimmedDescription);

      const url = editMode ? `/api/bab1/${currentBab1._id}` : '/api/bab1';
      const method = editMode ? 'put' : 'post';

      await axios[method](url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          email: auth.currentUser.email,
          Authorization: `Bearer ${token}`,
        },
      });

      alert(editMode ? 'Nota berjaya dikemas kini!' : 'Nota berjaya dimuat naik!');
      resetForm();
      fetchBab1List();
    } catch (err) {
      console.error('Ralat memuat naik Bab1:', err);
      alert('Muat naik gagal. Sila cuba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setError('');
    setEditMode(false);
    setCurrentBab1(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleBack = () => {
    navigate('/tingkatan-1/admin');
  };

  const handleEdit = (bab1) => {
    setTitle(bab1.title);
    setDescription(bab1.description);
    setCurrentBab1(bab1);
    setEditMode(true);
    setError('');
    setFile(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Adakah anda pasti mahu memadamkan Nota ini?')) {
      try {
        const token = await getIdToken(auth.currentUser);
        await axios.delete(`/api/bab1/${id}`, {
          headers: {
            email: auth.currentUser.email,
            Authorization: `Bearer ${token}`,
          },
        });

        alert('Nota berjaya dipadam!');
        fetchBab1List();
      } catch (err) {
        console.error('Ralat memadam Bab1:', err);
        alert('Gagal memadam nota. Sila cuba lagi.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={handleBack}> ← Kembali</button>

      <h1>Admin - Urus Kandungan Bab 1</h1>

      <div className={styles.uploadBox}>
        {!editMode && (
          <input
            ref={fileInputRef}
            id="fileInput"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
          />
        )}
        {(file || editMode) && (
          <div className={styles.form}>
            <input
              type="text"
              placeholder="Tajuk (wajib, maks 50 patah perkataan)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength="50"
            />
            <textarea
              placeholder="Penerangan (wajib, maks 50 patah perkataan)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength="50"
            ></textarea>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.buttonGroup}>
              <button onClick={handleUpload} disabled={isUploading}>
                {editMode ? 'Kemas Kini' : 'Simpan'}
              </button>
              <button onClick={handleCancel} disabled={isUploading}>Batal</button>
            </div>
          </div>
        )}
      </div>

      <h2>Senarai Kandungan Bab 1</h2>
      <ul className={styles.bab1List}>
        {bab1List.map(item => (
          <li key={item._id}>
            <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer">
              {item.title} - {item.description}
            </a>
            <div className={styles.actionButtons}>
              <button onClick={() => handleEdit(item)}>Kemas Kini</button>
              <button onClick={() => handleDelete(item._id)}>Padam</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminBab1;
