// src/components/dashboard/AdminLatihanModuleTingkatan1.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase-config';
import axios from 'axios';
import styles from './styles/StudentDashboard.module.css';

const AdminLatihanModuleTingkatan1 = () => {
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorAll, setErrorAll] = useState('');
  const [form, setForm] = useState({ title: '', description: '' });
  const [formError, setFormError] = useState('');
  const [isEditingId, setIsEditingId] = useState(null);

  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [studentAttempts, setStudentAttempts] = useState({});
  const [savingFeedbackId, setSavingFeedbackId] = useState(null);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get('/api/modules/tingkatan1', {
        headers: { Authorization: `Bearer ${token}`, email: auth.currentUser.email }
      });
      setModules(res.data);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setErrorAll('Could not load modules. Try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleBack = () => {
    navigate('/latihan/admin');
  };

  const handleTitleChange = (e) => setForm(f => ({ ...f, title: e.target.value }));
  const handleDescChange = (e) => setForm(f => ({ ...f, description: e.target.value }));

  const validateForm = () => {
    if (!form.title.trim()) return 'Title cannot be empty';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const errMsg = validateForm();
    if (errMsg) return setFormError(errMsg);

    try {
      const token = await auth.currentUser.getIdToken();
      if (isEditingId) {
        await axios.put(
          `/api/modules/tingkatan1/${isEditingId}`,
          { title: form.title.trim(), description: form.description.trim() },
          { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, email: auth.currentUser.email } }
        );
      } else {
        await axios.post(
          '/api/modules/tingkatan1',
          { title: form.title.trim(), description: form.description.trim() },
          { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, email: auth.currentUser.email } }
        );
      }
      setForm({ title: '', description: '' });
      setIsEditingId(null);
      fetchModules();
    } catch (err) {
      console.error('Error saving module:', err);
      setFormError(err.response?.data?.message || 'Server error. Try again.');
    }
  };

  const handleStartEdit = (mod) => {
    setIsEditingId(mod._id);
    setForm({ title: mod.title, description: mod.description || '' });
    setFormError('');
  };

  const handleDelete = async (modId) => {
    if (!window.confirm('Delete this module and all its exercises?')) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(
        `/api/modules/tingkatan1/${modId}`,
        { headers: { Authorization: `Bearer ${token}`, email: auth.currentUser.email } }
      );
      fetchModules();
    } catch (err) {
      console.error('Error deleting module:', err);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingId(null);
    setForm({ title: '', description: '' });
    setFormError('');
  };

  const handleToggleStudentStatus = async (moduleId) => {
    if (expandedModuleId === moduleId) {
      setExpandedModuleId(null);
      return;
    }

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get(`/api/attempts/tingkatan1/${moduleId}/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
          email: auth.currentUser.email
        }
      });

      const formatted = {};
      res.data.forEach((att) => {
        formatted[att._id] = {
          ...att,
          feedbackText: att.feedback || ''
        };
      });

      setStudentAttempts((prev) => ({ ...prev, [moduleId]: formatted }));
      setExpandedModuleId(moduleId);
    } catch (err) {
      console.error('Error loading student status:', err);
      alert('Failed to load student attempts.');
    }
  };

  const handleFeedbackChange = (moduleId, attemptId, value) => {
    setStudentAttempts((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [attemptId]: {
          ...prev[moduleId][attemptId],
          feedbackText: value
        }
      }
    }));
  };

  const handleSaveFeedback = async (attemptId, moduleId) => {
    const feedback = studentAttempts[moduleId][attemptId]?.feedbackText || '';
    try {
      setSavingFeedbackId(attemptId);
      const token = await auth.currentUser.getIdToken();
      await axios.put(
        `/api/attempts/${attemptId}/feedback`,
        { feedback },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            email: auth.currentUser.email
          }
        }
      );
    } catch (err) {
      console.error('Error saving feedback:', err);
      alert('Failed to save feedback.');
    } finally {
      setSavingFeedbackId(null);
    }
  };

  const handleGotoExercises = (modId) => {
    navigate(`/module-latihan-tingkatan-1/${modId}/admin`);
  };

  return (
    <div className={styles.dashboardContainer}>
      <button className={styles.backButton} onClick={handleBack}>
        ← Back
      </button>

      <div className={styles.mainContent}>
        <h1>Latihan Tingkatan 1 Modules (Admin)</h1>

        <section className={styles.formSection}>
          <h2>{isEditingId ? 'Edit Module' : 'Create New Module'}</h2>
          <form onSubmit={handleSubmit} className={styles.smallForm}>
            <div className={styles.field}>
              <label>Module Title:</label>
              <input
                type="text"
                value={form.title}
                onChange={handleTitleChange}
                placeholder="Module title"
                className={styles.profileInput}
              />
            </div>
            <div className={styles.field} style={{ marginTop: '0.5rem' }}>
              <label>Description (optional):</label>
              <textarea
                value={form.description}
                onChange={handleDescChange}
                placeholder="Short description..."
                rows={2}
                className={styles.profileInput}
              />
            </div>
            {formError && <div className={styles.profileError}>{formError}</div>}
            <button type="submit" className={styles.profileSaveButton} style={{ marginTop: '1rem' }}>
              {isEditingId ? 'Save Changes' : 'Create Module'}
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
          </form>
        </section>

        <hr style={{ margin: '2rem 0' }} />

        {loading ? (
          <p>Loading modules…</p>
        ) : modules.length === 0 ? (
          <p style={{ fontStyle: 'italic' }}>No modules created yet.</p>
        ) : (
          modules.map((mod) => (
            <div key={mod._id} className={styles.forumTopicCard} style={{ marginBottom: '1.5rem' }}>
              <h2>{mod.title}</h2>
              <p style={{ fontStyle: mod.description ? 'normal' : 'italic' }}>
                {mod.description || 'No description provided.'}
              </p>
              <small style={{ color: '#666' }}>
                Created: {new Date(mod.createdAt).toLocaleString()}<br />
                Updated: {new Date(mod.updatedAt).toLocaleString()}
              </small>
              <div style={{ marginTop: '0.5rem' }}>
                <button
                  onClick={() => handleGotoExercises(mod._id)}
                  className={styles.smallButton}
                  style={{ marginRight: '0.5rem' }}
                >
                  Manage Exercises
                </button>
                <button
                  onClick={() => handleToggleStudentStatus(mod._id)}
                  className={styles.smallButton}
                  style={{ marginRight: '0.5rem' }}
                >
                  {expandedModuleId === mod._id ? 'Hide Student Status' : 'View Student Status'}
                </button>

                {expandedModuleId === mod._id && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid #ccc', paddingTop: '1rem' }}>
                    <h3>Student Status</h3>
                    {studentAttempts[mod._id] ? (
                      Object.values(studentAttempts[mod._id]).length === 0 ? (
                        <p>No attempts yet.</p>
                      ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Score</th>
                              <th>Status</th>
                              <th>Feedback</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.values(studentAttempts[mod._id]).map((att) => (
                              <tr key={att._id}>
                                <td>{att.student?.username || att.student?.email || 'Unknown'}</td>
                                <td>
                                  {att.answers.length > 0
                                    ? `${att.answers.filter(a => a.correct).length} / ${att.answers.length}`
                                    : '-'}
                                </td>
                                <td>{att.answers.length > 0 ? 'Complete' : 'Incomplete'}</td>
                                <td>
                                  <textarea
                                    rows={2}
                                    style={{ width: '100%' }}
                                    value={att.feedbackText}
                                    onChange={(e) => handleFeedbackChange(mod._id, att._id, e.target.value)}
                                  />
                                </td>
                                <td>
                                  <button
                                    onClick={() => handleSaveFeedback(att._id, mod._id)}
                                    disabled={savingFeedbackId === att._id}
                                  >
                                    {savingFeedbackId === att._id ? 'Saving…' : 'Save'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )
                    ) : (
                      <p>Loading student data…</p>
                    )}
                  </div>
                )}
                <button
                  onClick={() => handleStartEdit(mod)}
                  className={styles.smallButton}
                  style={{ marginRight: '0.5rem' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(mod._id)}
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

export default AdminLatihanModuleTingkatan1;
