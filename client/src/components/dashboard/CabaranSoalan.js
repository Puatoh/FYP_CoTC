// /client/src/components/dashboard/CabaranSoalan.js
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../../firebase-config";
import styles from "./styles/StudentDashboard.module.css";

const CabaranSoalan = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [usedHelp, setUsedHelp] = useState(false);
  const [hiddenIndex, setHiddenIndex] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef();

  useEffect(() => {
    const fetchChallenge = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      try {
        const res = await axios.get(`/api/challenges/${id}`, {
          headers: { Authorization: `Bearer ${token}`, email: user.email },
        });
        setChallenge(res.data);
        setTimeLeft(res.data.duration * 60);
      } catch {
        alert("Gagal memuatkan cabaran");
        navigate("/cabaran");
      }
    };
    fetchChallenge();
  }, [id]);

  useEffect(() => {
    if (!challenge) return;
    if (timeLeft <= 0) return submitAll();
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, challenge]);

  const q = challenge?.questions[current];

  const selectAnswer = (i) => {
    if (selected != null) return;
    setSelected(i);
  };

  const useHelp = () => {
    if (usedHelp) return;
    const wrong = q.choices.map((_, i) => i).filter(i => !q.correct.includes(i));
    const random = wrong[Math.floor(Math.random() * wrong.length)];
    setHiddenIndex(random);
    setUsedHelp(true);
  };

  const submitAnswer = () => {
    if (selected == null) return alert("Sila pilih jawapan");
    const isCorrect = q.correct.includes(selected);
    const pts = isCorrect ? q.points : 0;
    setFeedback(isCorrect ? "Betul!" : "Salah!");
    setScore((s) => s + pts);

    setAnswers((arr) => [
      ...arr,
      { questionId: q._id, selected, isCorrect, pointsEarned: pts, usedHelp },
    ]);

    setTimeout(() => {
      const next = current + 1;
      if (next >= challenge.questions.length) {
        submitAll();
      } else {
        setCurrent(next);
        setSelected(null);
        setUsedHelp(false);
        setHiddenIndex(null);
        setFeedback(null);
      }
    }, 2000);
  };

  const submitAll = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await axios.post(
        `/api/challenges/${id}/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${token}`, email: user.email } }
      );
    } catch {
      console.error("Submit failed");
    } finally {
      clearTimeout(timerRef.current);
      navigate(`/cabaran-leaderboard/${id}`);
    }
  };

  if (!challenge) return <p>Sedang memuatkan...</p>;
  if (!q) return null; // handled in submitAll()

  const minutes = Math.floor(timeLeft / 60);
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.challengeHeader}>
        <h2>{challenge.title}</h2>
        <div>Masa Terapung: {minutes}:{seconds}</div>
        <div>Soalan {current + 1}/{challenge.questions.length}</div>
        <div>Skor: {score}</div>
      </div>

      <div className={styles.questionCard}>
        <p className={styles.questionText}>{q.text}</p>
        {q.choices.map((choice, i) => (
          <button
            key={i}
            disabled={selected != null || hiddenIndex === i}
            className={`${styles.choiceButton}
              ${selected === i ? styles.selected : ""}
              ${hiddenIndex === i ? styles.hiddenChoice : ""}`}
            onClick={() => selectAnswer(i)}
          >
            {choice}
          </button>
        ))}

        <div className={styles.questionActions}>
          <button onClick={useHelp} disabled={usedHelp || selected != null}>Bantuan 😇</button>
          <button onClick={submitAnswer} disabled={selected == null || feedback != null}>Hantar Jawapan</button>
        </div>

        {feedback && (
          <div className={feedback === "Betul!" ? styles.correct : styles.incorrect}>
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
};


export default CabaranSoalan;