// src/components/dashboard/LatihanTingkatan1.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth } from '../../firebase-config';
import axios from 'axios';
import styles from './styles/StudentDashboard.module.css';

const LatihanTingkatan1 = () => {
  const navigate = useNavigate();
  const { moduleId } = useParams();

  // ─── State ────────────────────────────────────────────────────────────────
  const [moduleTitle, setModuleTitle] = useState('Latihan Tingkatan 1');
  const [exercises, setExercises]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [results, setResults]         = useState({});
  const [submitted, setSubmitted]     = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback]       = useState('');

  // ─── Load module info, exercises, and any prior attempt ─────────────────
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const token = await auth.currentUser.getIdToken();

        // 1) Module details
        const modRes = await axios.get(
          `/api/modules/tingkatan1/${moduleId}`,
          { headers: { Authorization: `Bearer ${token}`, email: auth.currentUser.email } }
        );
        setModuleTitle(modRes.data.title || moduleTitle);

        // 2) Exercises
        const exRes = await axios.get(
          `/api/exercises/tingkatan1/${moduleId}`,
          { headers: { Authorization: `Bearer ${token}`, email: auth.currentUser.email } }
        );
        setExercises(exRes.data);

        // 3) Existing attempt?
        try {
          const atRes = await axios.get(
            `/api/attempts/tingkatan1/${moduleId}`,
            { headers: { Authorization: `Bearer ${token}`, email: auth.currentUser.email } }
          );
          const att = atRes.data;
          setSubmitted(true);
          setFeedback(att.feedback || '');

          // reconstruct answers & results
          const sel = {};
          const resMap = {};
          let corr = 0;

          att.answers.forEach((ans) => {
            sel[ans.exerciseId] = ans.chosen;
            resMap[ans.exerciseId] = {
              correct: ans.correct,
              chosen: ans.chosen,
              correctAnswers:
                exRes.data.find((e) => e._id === ans.exerciseId)?.correctAnswers || []
            };
            if (ans.correct) corr += 1;
          });

          setSelectedAnswers(sel);
          setResults(resMap);
          setCorrectCount(corr);
        } catch {
          // no prior attempt—skip
        }
      } catch (err) {
        console.error(err);
        setFetchError('Gagal memuat data. Sila cuba sekali lagi.');
      } finally {
        setLoading(false);
      }
    };

    // hydrate draft if exists
    const draft = localStorage.getItem(`latihan1_${moduleId}`);
    if (draft) setSelectedAnswers(JSON.parse(draft));

    loadAll();
  }, [moduleId]);

  // ─── Save draft in localStorage until submit ──────────────────────────────
  useEffect(() => {
    if (!submitted) {
      localStorage.setItem(
        `latihan1_${moduleId}`,
        JSON.stringify(selectedAnswers)
      );
    }
  }, [selectedAnswers, submitted, moduleId]);

  // ─── Warn on unload & clear draft on unmount without submit ──────────────
  useEffect(() => {
    const handleBefore = (e) => {
      if (!submitted) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBefore);
    return () => {
      window.removeEventListener('beforeunload', handleBefore);
      if (!submitted) localStorage.removeItem(`latihan1_${moduleId}`);
    };
  }, [submitted, moduleId]);

  // ─── Option handlers ─────────────────────────────────────────────────────
  const toggleOption = (exerciseId, idx) => {
    setSelectedAnswers((prev) => {
      const arr = prev[exerciseId] || [];
      const next = arr.includes(idx)
        ? arr.filter((i) => i !== idx)
        : [...arr, idx];
      return { ...prev, [exerciseId]: next };
    });
  };
  const selectOption = (exerciseId, idx) => {
    setSelectedAnswers((prev) => ({ ...prev, [exerciseId]: [idx] }));
  };

  // ─── Submit & record attempt ──────────────────────────────────────────────
  const handleSubmitAll = async () => {
    const answers = [];
    let corr = 0;

    exercises.forEach((ex) => {
      const chosen = selectedAnswers[ex._id] || [];
      const cSet = new Set(ex.correctAnswers);
      const chSet = new Set(chosen);
      const isCorr = cSet.size === chSet.size && [...cSet].every((i) => chSet.has(i));
      answers.push({ exerciseId: ex._id, chosen, correct: isCorr });
      if (isCorr) corr += 1;
    });

    // show client‑side results immediately
    setResults(Object.fromEntries(
      answers.map((a) => [a.exerciseId, {
        correct: a.correct,
        chosen: a.chosen,
        correctAnswers:
          exercises.find((e) => e._id === a.exerciseId).correctAnswers
      }])
    ));
    setCorrectCount(corr);

    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(
        `/api/attempts/tingkatan1/${moduleId}`,
        { answers },
        { headers: { Authorization: `Bearer ${token}`, email: auth.currentUser.email } }
      );
      setSubmitted(true);
      localStorage.removeItem(`latihan1_${moduleId}`);
    } catch (err) {
      console.error('Gagal menghantar jawapan. Sila cuba lagi.', err);
      alert('Gagal menghantar jawapan. Sila cuba lagi.');
    }
  };

  // ─── Guard Back navigation ────────────────────────────────────────────────
  const handleBack = () => {
    if (!submitted) {
      alert('Sila hantar jawapan sebelum meninggalkan halaman ini.');
      return;
    }
    navigate('/module-latihan-tingkatan-1');
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.dashboardContainer}>
      <button className={styles.backButton} onClick={handleBack}>
        ← Kembali
      </button>
      <div className={styles.mainContent}>
        <h1>{moduleTitle}</h1>

        {submitted && (
          <>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Anda telah menjawab {correctCount} daripada {exercises.length} soalan dengan betul.
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3>Maklum balas:</h3>
              <p style={{
                fontStyle: feedback ? 'normal' : 'italic',
                color: feedback ? '#000' : '#666'
              }}>
                {feedback || 'Tiada maklum balas daripada admin.'}
              </p>
            </div>
          </>
        )}

        {loading ? (
          <p>Loading exercises…</p>
        ) : fetchError ? (
          <p style={{ color: 'red' }}>{fetchError}</p>
        ) : exercises.length === 0 ? (
          <p style={{ fontStyle: 'italic', marginTop: '1rem' }}>
            Tiada latihan tersedia buat masa ini.
          </p>
        ) : (
          <>
            {exercises.map((ex) => {
              const isMultiple = ex.correctAnswers.length > 1;
              const chosen = selectedAnswers[ex._id] || [];
              const result = results[ex._id];

              return (
                <div
                  key={ex._id}
                  className={styles.forumTopicCard}
                  style={{ marginBottom: '1.5rem' }}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: ex.question }}
                    style={{
                      padding: '0.5rem',
                      background: '#f1f1f1',
                      borderRadius: '4px'
                    }}
                  />
                  <div style={{ marginTop: '0.75rem' }}>
                    {ex.options.map((opt, idx) => (
                      <div key={idx} style={{ margin: '0.5rem 0' }}>
                        <label style={{ cursor: 'pointer' }}>
                          {isMultiple ? (
                            <input
                              type="checkbox"
                              checked={chosen.includes(idx)}
                              disabled={submitted}
                              onChange={() => toggleOption(ex._id, idx)}
                              style={{ marginRight: '0.5rem' }}
                            />
                          ) : (
                            <input
                              type="radio"
                              name={`q_${ex._id}`}
                              checked={chosen.includes(idx)}
                              disabled={submitted}
                              onChange={() => selectOption(ex._id, idx)}
                              style={{ marginRight: '0.5rem' }}
                            />
                          )}
                          <span dangerouslySetInnerHTML={{ __html: opt }} />
                        </label>
                      </div>
                    ))}
                  </div>
                  {result && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.75rem',
                      background: result.correct ? '#d4edda' : '#f8d7da',
                      borderRadius: '4px'
                    }}>
                      {result.correct ? (
                        <strong style={{ color: '#155724' }}>Betul!</strong>
                      ) : (
                        <div style={{ color: '#721c24' }}>
                          <strong>Salah.</strong> Jawapan betul:
                          <ul style={{ marginTop: '0.5rem' }}>
                            {result.correctAnswers.map((c) => (
                              <li key={c}>
                                <span dangerouslySetInnerHTML={{
                                  __html: ex.options[c]
                                }} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {!submitted && (
              <button
                onClick={handleSubmitAll}
                className={styles.profileSaveButton}
                style={{ marginTop: '1rem' }}
              >
                Hantar Jawapan
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LatihanTingkatan1;
