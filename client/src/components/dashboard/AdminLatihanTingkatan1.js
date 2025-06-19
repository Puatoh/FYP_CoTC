// src/components/dashboard/AdminLatihanTingkatan1.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth } from '../../firebase-config';
import axios from 'axios';
import styles from './styles/StudentDashboard.module.css';

/**
 * This page shows all exercises for a single ModuleT1. Admin can:
 *  1) Create a new exercise under that module.
 *  2) Edit / Delete existing exercises.
 *
 * ROUTE: /module-latihan-tingkatan-1/:moduleId/admin
 */
const AdminLatihanTingkatan1 = () => {
  const navigate = useNavigate();
  const { moduleId } = useParams();

  // ─── State ────────────────────────────────────────────────────────────────
  const [moduleInfo, setModuleInfo] = useState(null);
  const [exercises, setExercises]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [errorAll, setErrorAll]       = useState('');

  // Form state for creating or editing an exercise:
  const initialForm = {
    question: '',
    options: ['', '', '', ''],
    correctAnswers: [] // array of indices 0..3
  };
  const [formState, setFormState] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [isEditingId, setIsEditingId] = useState(null);

  // ─── Fetch module details + exercises on mount ────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken();

      // 1) fetch module info
      const modRes = await axios.get(`/api/modules/tingkatan1/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}`, email: auth.currentUser.email }
      });
      setModuleInfo(modRes.data);

      // 2) fetch exercises under that module
      const exRes = await axios.get(`/api/exercises/tingkatan1/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}`, email: auth.currentUser.email }
      });
      setExercises(exRes.data);
    } catch (err) {
      console.error('Error fetching module/exercises:', err);
      setErrorAll('Could not load module or exercises. Try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [moduleId]);

  // ─── Handle “Back” button ─────────────────────────────────────────────────
  const handleBack = () => {
    navigate('/module-latihan-tingkatan-1/admin');
  };

  // ─── Form handlers ────────────────────────────────────────────────────────
  const handleQuestionChange = (e) => {
    setFormState(f => ({ ...f, question: e.target.value }));
  };

  const handleOptionChange = (index, value) => {
    setFormState(f => {
      const opts = [...f.options];
      opts[index] = value;
      return { ...f, options: opts };
    });
  };

  const handleToggleCorrect = (index) => {
    setFormState(f => {
      const already = f.correctAnswers.includes(index);
      let updated;
      if (already) {
        updated = f.correctAnswers.filter(i => i !== index);
      } else {
        updated = [...f.correctAnswers, index];
      }
      return { ...f, correctAnswers: updated };
    });
  };

  const validateForm = () => {
    const { question, options, correctAnswers } = formState;
    if (!question.trim()) return 'Question cannot be empty.';
    // Count non‐empty options
    const nonEmptyOpts = options.filter(o => o.trim() !== '');
    if (nonEmptyOpts.length < 2) {
      return 'You must provide at least 2 options.';
    }
    if (correctAnswers.length === 0) {
      return 'At least one correct answer must be selected.';
    }
    // Ensure each correctAnswers index points to a non‐empty option
    for (let idx of correctAnswers) {
      if (!options[idx] || !options[idx].trim()) {
        return 'Correct answer must correspond to a non-empty option.';
      }
    }
    return '';
  };

  // ─── Submit (Create or Update) ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const validationMsg = validateForm();
    if (validationMsg) {
      setFormError(validationMsg);
      return;
    }

    const payload = {
      question: formState.question.trim(),
      // strip out empty options (backend will enforce 2–4 length)
      options: formState.options.map(o => o.trim()).filter(o => o !== ''),
      correctAnswers: formState.correctAnswers
    };

    try {
      const token = await auth.currentUser.getIdToken();
      if (isEditingId) {
        // Update existing exercise
        await axios.put(
          `/api/exercises/tingkatan1/${moduleId}/${isEditingId}`,
          payload,
          { headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              email: auth.currentUser.email
            }
          }
        );
      } else {
        // Create new exercise under this module
        await axios.post(
          `/api/exercises/tingkatan1/${moduleId}`,
          payload,
          { headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              email: auth.currentUser.email
            }
          }
        );
      }
      // Reset form and reload
      setFormState(initialForm);
      setIsEditingId(null);
      fetchData();
    } catch (err) {
      console.error('Error saving exercise:', err);
      setFormError(err.response?.data?.message || 'Server error. Try again.');
    }
  };

  // ─── “Edit” an existing exercise ────────────────────────────────────────────
  const handleStartEdit = (ex) => {
    setIsEditingId(ex._id);
    // Build a 4-element array (pad with empty strings if fewer than 4)
    const optsArr = [...ex.options];
    while (optsArr.length < 4) optsArr.push('');
    setFormState({
      question: ex.question,
      options: optsArr,
      correctAnswers: ex.correctAnswers
    });
    setFormError('');
  };

  // ─── Delete an exercise ────────────────────────────────────────────────────
  const handleDelete = async (exId) => {
    if (!window.confirm('Delete this exercise?')) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(
        `/api/exercises/tingkatan1/${moduleId}/${exId}`,
        { headers: { Authorization: `Bearer ${token}`, email: auth.currentUser.email } }
      );
      fetchData();
    } catch (err) {
      console.error('Error deleting exercise:', err);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingId(null);
    setFormState(initialForm);
    setFormError('');
  };

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.dashboardContainer}>
      <button className={styles.backButton} onClick={handleBack}>
        ← Back
      </button>

      <div className={styles.mainContent}>
        <h1>
          {moduleInfo ? moduleInfo.title : 'Loading...'} &nbsp;
          <span style={{ fontSize: '0.8rem', color: '#666' }}>
            (Admin)
          </span>
        </h1>
        {moduleInfo && <p style={{ fontStyle: moduleInfo.description ? 'normal' : 'italic' }}>
          {moduleInfo.description || 'No description.'}
        </p>}

        <hr style={{ margin: '1rem 0' }} />

        {/* ─── FORM: Create or Edit an exercise ────────────────────────────── */}
        <section className={styles.formSection}>
          <h2>{isEditingId ? 'Edit Exercise' : 'Create New Exercise'}</h2>
          <form onSubmit={handleSubmit} className={styles.smallForm}>
            <div className={styles.field}>
              <label>Question (HTML allowed):</label>
              <textarea
                value={formState.question}
                onChange={handleQuestionChange}
                placeholder="Use basic HTML tags (e.g. <b>, <i>) if needed"
                rows={3}
                className={styles.profileInput}
              />
            </div>

            {/* 4 possible options */}
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className={styles.field} style={{ marginTop: '0.5rem' }}>
                <label>Option {idx + 1}:</label>
                <input
                  type="text"
                  value={formState.options[idx]}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className={styles.profileInput}
                />
                <label style={{ marginLeft: '1rem' }}>
                  <input
                    type="checkbox"
                    checked={formState.correctAnswers.includes(idx)}
                    onChange={() => handleToggleCorrect(idx)}
                  />
                  {' '}Correct
                </label>
              </div>
            ))}

            {formError && <div className={styles.profileError}>{formError}</div>}

            <div style={{ marginTop: '1rem' }}>
              <button type="submit" className={styles.profileSaveButton}>
                {isEditingId ? 'Save Changes' : 'Create Exercise'}
              </button>
              {isEditingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className={styles.profileCancelButton}
                  style={{ marginLeft: '0.5rem' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <hr style={{ margin: '2rem 0' }} />

        {/* ─── LIST ALL EXERCISES FOR THIS MODULE ────────────────────────────── */}
        {loading ? (
          <p>Loading exercises…</p>
        ) : (exercises.length === 0) ? (
          <p style={{ fontStyle: 'italic' }}>No exercises created in this module yet.</p>
        ) : (
          exercises.map((ex) => (
            <div key={ex._id} className={styles.forumTopicCard} style={{ marginBottom: '1.5rem' }}>
              <div
                dangerouslySetInnerHTML={{ __html: ex.question }}
                style={{ padding: '0.5rem', background: '#f9f9f9', borderRadius: '4px' }}
              />
              <ul style={{ marginTop: '0.5rem' }}>
                {ex.options.map((opt, i) => (
                  <li key={i} style={{ color: ex.correctAnswers.includes(i) ? 'green' : 'black' }}>
                    {opt} {ex.correctAnswers.includes(i) && <strong>(✔)</strong>}
                  </li>
                ))}
              </ul>
              <small style={{ color: '#666' }}>
                Created: {new Date(ex.createdAt).toLocaleString()}<br />
                Updated: {new Date(ex.updatedAt).toLocaleString()}
              </small>
              <div style={{ marginTop: '0.5rem' }}>
                <button
                  onClick={() => handleStartEdit(ex)}
                  className={styles.smallButton}
                  style={{ marginRight: '0.5rem' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(ex._id)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminLatihanTingkatan1;