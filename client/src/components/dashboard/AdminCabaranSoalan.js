// /client/src/components/dashboard/AdminCabaranSoalan.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../../firebase-config';
import axios from 'axios';
import styles from './styles/StudentDashboard.module.css';

const AdminCabaranSoalan = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [rules, setRules] = useState('');
    const [duration, setDuration] = useState(10);
    const [questions, setQuestions] = useState([]);
    const [status, setStatus] = useState('Aktif');
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(searchParams.get('id'));
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchChallenge = async () => {
            if (!editingId) return;
            const currentUser = auth.currentUser;
            if (!currentUser) return;
            const token = await currentUser.getIdToken();
            try {
                const res = await axios.get(`https://cotc-backend.onrender.com/api/challenges/${editingId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        email: currentUser.email,
                    },
                });
                const ch = res.data;
                setTitle(ch.title);
                setDescription(ch.description);
                setRules(ch.rules);
                setDuration(ch.duration);
                setStatus(ch.status);
                setQuestions(ch.questions || []);
            } catch (err) {
                setError('Gagal mendapatkan data cabaran.');
            }
        };
        fetchChallenge();
    }, [editingId]);

    const handleAddQuestion = () => {
        if (questions.length >= 20) return alert('Had maksimum 20 soalan.');
        setQuestions([
            ...questions,
            { text: '', choices: ['', ''], correct: [], points: 1, open: true },
        ]);
    };

    const handleChange = (index, field, value) => {
        const updated = [...questions];
        updated[index][field] = value;
        setQuestions(updated);
    };

    const handleChoiceChange = (qIndex, cIndex, value) => {
        const updated = [...questions];
        updated[qIndex].choices[cIndex] = value;
        setQuestions(updated);
    };

    const handleAddChoice = index => {
        const updated = [...questions];
        if (updated[index].choices.length < 4) {
            updated[index].choices.push('');
            setQuestions(updated);
        }
    };

    const handleToggleCorrect = (qIndex, cIndex) => {
        const updated = [...questions];
        const correct = updated[qIndex].correct;
        if (correct.includes(cIndex)) {
            updated[qIndex].correct = correct.filter(i => i !== cIndex);
        } else {
            updated[qIndex].correct = [...correct, cIndex];
        }
        setQuestions(updated);
    };

    const handleDeleteQuestion = index => {
        if (!window.confirm('Padam soalan ini?')) return;
        const updated = [...questions];
        updated.splice(index, 1);
        setQuestions(updated);
    };

    const handleToggleCollapse = index => {
        const updated = [...questions];
        updated[index].open = !updated[index].open;
        setQuestions(updated);
    };

    const handleSave = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        if (!title.trim()) return alert('Tajuk diperlukan.');
        if (questions.length === 0) return alert('Sekurang-kurangnya satu soalan diperlukan.');
        for (let q of questions) {
            if (!q.text || q.choices.length < 2 || q.correct.length === 0) {
                return alert('Pastikan semua soalan lengkap dan jawapan ditanda.');
            }
        }
        setLoading(true);
        const token = await currentUser.getIdToken();
        const payload = { title, description, rules, duration, status, questions };
        try {
            if (editingId) {
                await axios.put(`https://cotc-backend.onrender.com/api/challenges/${editingId}`, payload, {
                    headers: { Authorization: `Bearer ${token}`, email: currentUser.email },
                });
            } else {
                await axios.post('https://cotc-backend.onrender.com/api/challenges', payload, {
                    headers: { Authorization: `Bearer ${token}`, email: currentUser.email },
                });
            }
            alert('Cabaran berjaya disimpan.');
            navigate('/cabaran/admin');
        } catch (err) {
            alert('Ralat semasa menyimpan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${styles.dashboardContainer} ${styles.challengeForm}`}>
            <button className={styles.backButton} onClick={() => navigate('/cabaran/admin')}>← Back</button>
            <h2>{editingId ? 'Edit Challenge' : 'Create New Challenge'}</h2>

            <div className={styles.formGroup}>
                <label className={styles.formLabel}>Challenge Title</label>
                <textarea
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g.: Weekly Science Challenge"
                    className={styles.formInput}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g.: Students must answer 10 questions on current topics."
                    className={styles.formInput}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel}>Rules</label>
                <textarea
                    value={rules}
                    onChange={e => setRules(e.target.value)}
                    placeholder="e.g.: Answer within 10 minutes. No points deducted for wrong answers."
                    className={styles.formInput}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel}>Duration (minutes)</label>
                <input
                    type="number"
                    value={duration}
                    onChange={e => setDuration(parseInt(e.target.value))}
                    placeholder="e.g.: 10"
                    className={styles.formInput}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status</label>
                <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className={styles.formInput}
                >
                    <option value="Aktif">Active</option>
                    <option value="Ditutup">Closed</option>
                </select>
            </div>

            <h3>Question List</h3>
            {questions.map((q, i) => (
                <div key={i} className={styles.questionCard}>
                    <div className={styles.questionHeader} onClick={() => handleToggleCollapse(i)}>
                        <strong>Question {i + 1}</strong>
                        <span>{q.open ? '▲' : '▼'}</span>
                    </div>
                    {q.open && (
                        <div className={styles.questionBody}>
                            <textarea
                                value={q.text}
                                onChange={e => handleChange(i, 'text', e.target.value)}
                                placeholder="Question Text"
                                className={styles.profileInput}
                            />
                            {q.choices.map((choice, j) => (
                                <div key={j} className={styles.choiceRow}>
                                    <input
                                        type="checkbox"
                                        checked={q.correct.includes(j)}
                                        onChange={() => handleToggleCorrect(i, j)}
                                    />
                                    <input
                                        value={choice}
                                        onChange={e => handleChoiceChange(i, j, e.target.value)}
                                        placeholder={`Choice ${j + 1}`}
                                        className={styles.profileInput}
                                    />
                                </div>
                            ))}
                            {q.choices.length < 4 && (
                                <button className={styles.smallButton} onClick={() => handleAddChoice(i)}>+ Choice</button>
                            )}
                            <div className={styles.formGroup} style={{ marginTop: '0.5rem' }}>
                                <label className={styles.formLabel} style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={q.allowHelp !== false} // default true
                                        onChange={() => handleChange(i, 'allowHelp', q.allowHelp === false)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    Allow Help Function (👼)
                                </label>
                            </div>

                            <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}>
                                <label className={styles.formLabel}>Points:</label>
                                <input
                                    type="number"
                                    value={q.points}
                                    onChange={e => handleChange(i, 'points', parseInt(e.target.value))}
                                    placeholder="1"
                                    className={styles.profileInput}
                                    style={{ width: '100px' }}
                                />
                            </div>
                            <button className={styles.deleteButton} onClick={() => handleDeleteQuestion(i)}>Delete Question</button>
                        </div>
                    )}
                </div>
            ))}

            <button onClick={handleAddQuestion} className={styles.profileSaveButton}>+ Add Question</button>
            <button onClick={handleSave} className={styles.profileSaveButton} disabled={loading} style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                {loading ? 'Saving...' : 'Save Challenge'}
            </button>
        </div>
    );
};

export default AdminCabaranSoalan;
