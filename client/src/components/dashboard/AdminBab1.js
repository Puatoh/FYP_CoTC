// src/components/dashboard/AdminBab1.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './styles/AdminBab1.module.css';
import { auth } from '../../firebase-config';
import { getIdToken } from 'firebase/auth';

const AdminBab1 = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // For safe access to <input type="file" />

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
      console.error('Error fetching Bab1:', err);
    }
  };

  useEffect(() => {
    fetchBab1List();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 100 * 1024 * 1024) {
      alert('File size must be under 100MB.');
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
      setError('Please select a PDF file.');
      return;
    }

    if (!trimmedTitle || !trimmedDescription) {
      setError('Title and Description cannot be empty.');
      return;
    }

    if (trimmedTitle.length > 50 || trimmedDescription.length > 50) {
      setError('Title and Description must be under 50 words.');
      return;
    }

    try {
      setIsUploading(true);
      const token = await getIdToken(auth.currentUser);

      const formData = new FormData();
      if (file) formData.append('pdf', file); // Only append if file is selected
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

      alert(editMode ? 'PDF updated successfully!' : 'PDF uploaded successfully!');
      resetForm();
      fetchBab1List();
    } catch (err) {
      console.error('Error uploading Bab1:', err);
      alert('Upload failed. Please try again.');
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
    setFile(null); // optional: reset file on edit mode
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this PDF?')) {
      try {
        const token = await getIdToken(auth.currentUser);
        await axios.delete(`/api/bab1/${id}`, {
          headers: {
            email: auth.currentUser.email,
            Authorization: `Bearer ${token}`,
          },
        });

        alert('PDF deleted successfully!');
        fetchBab1List();
      } catch (err) {
        console.error('Error deleting Bab1:', err);
        alert('Failed to delete PDF. Please try again.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={handleBack}>Back</button>

      <h1>Admin - Manage Bab 1 Content</h1>

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
              placeholder="Title (required, max 50 words)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength="50"
            />
            <textarea
              placeholder="Description (required, max 50 words)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength="50"
            ></textarea>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.buttonGroup}>
              <button onClick={handleUpload} disabled={isUploading}>
                {editMode ? 'Update' : 'Save'}
              </button>
              <button onClick={handleCancel} disabled={isUploading}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      <h2>Existing Bab 1 Contents</h2>
      <ul className={styles.bab1List}>
        {bab1List.map(item => (
          <li key={item._id}>
            <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer">
              {item.title} - {item.description}
            </a>
            <div className={styles.actionButtons}>
              <button onClick={() => handleEdit(item)}>Edit</button>
              <button onClick={() => handleDelete(item._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminBab1;
