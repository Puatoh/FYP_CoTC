import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../../firebase-config";
import styles from "./styles/StudentDashboard.module.css";
import bgMusic from "../../KunKunDaytime.mp3";

// Optional: Replace with actual sound files if needed
const correctSoundSrc = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
const wrongSoundSrc = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

const CabaranSoalan = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState([]);
  const [usedHelp, setUsedHelp] = useState(false);
  const [hiddenIndex, setHiddenIndex] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [unMuted, setIsUnMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const timerRef = useRef();
  const musicRef = useRef();
  const correctSoundRef = useRef();
  const wrongSoundRef = useRef();

  useEffect(() => {
    const fetchChallenge = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      try {
        const res = await axios.get(`https://cotc-backend.onrender.com/api/challenges/${id}`, {
          headers: { Authorization: `Bearer ${token}`, email: user.email },
        });
        setChallenge(res.data);
        setTimeLeft(res.data.duration * 60);
        setStartTime(new Date().toISOString());
      } catch {
        alert("Gagal memuatkan cabaran");
        navigate("/cabaran");
      }
    };
    fetchChallenge();
  }, [id]);

  // Start timer after user begins challenge
  useEffect(() => {
    if (!challenge || !hasStarted) return;
    if (timeLeft <= 0) return submitAll();
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, challenge, hasStarted]);

  // Music playback logic
  useEffect(() => {
  const audio = musicRef.current;
  if (!audio) return;

  audio.volume = 0.4;
  audio.loop = true;

  if (unMuted && hasStarted) {
    if (audio.ended) {
      audio.currentTime = 0;
      audio.load();
    }
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Music autoplay was blocked or interrupted.", err.message);
      });
    }
  } else {
    audio.pause();
  }
}, [unMuted, hasStarted]);


  const q = challenge?.questions[current];
  const multipleExpected = q?.correct.length > 1;

  const toggleSelect = (i) => {
    if (feedback) return;
    setSelected((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  const useHelp = () => {
    if (usedHelp) return;
    const wrong = q.choices.map((_, i) => i).filter((i) => !q.correct.includes(i));
    const random = wrong[Math.floor(Math.random() * wrong.length)];
    setHiddenIndex(random);
    setUsedHelp(true);
  };

  const submitAnswer = () => {
    if (selected.length === 0) return alert("Sila pilih sekurang-kurangnya satu jawapan");

    const correctSorted = [...q.correct].sort().join(",");
    const selectedSorted = [...selected].sort().join(",");
    const isCorrect = selectedSorted === correctSorted;
    const pts = isCorrect ? q.points : 0;

    if (isCorrect) {
      correctSoundRef.current?.play();
    } else {
      wrongSoundRef.current?.play();
    }

    setFeedback(isCorrect ? "Betul!" : "Salah!");
    setScore((s) => s + pts);
    setShowCorrect(true);

    setAnswers((arr) => [
      ...arr,
      {
        questionId: q._id,
        questionIndex: current,
        selected: selected.map(Number),
        isCorrect,
        pointsEarned: pts,
        usedHelp,
      },
    ]);

    setTimeout(() => {
      const next = current + 1;
      if (next >= challenge.questions.length) {
        submitAll();
      } else {
        setCurrent(next);
        setSelected([]);
        setUsedHelp(false);
        setHiddenIndex(null);
        setFeedback(null);
        setShowCorrect(false);
      }
    }, 2000);
  };

  const submitAll = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // 🧠 If last question is unanswered via "Hantar" but has selections
    const currentQ = challenge.questions[current];
    const alreadyAnswered = answers.some(a => a.questionId === currentQ._id);

    if (!alreadyAnswered && selected.length > 0) {
      const correctSorted = [...currentQ.correct].sort().join(",");
      const selectedSorted = [...selected].sort().join(",");
      const isCorrect = selectedSorted === correctSorted;
      const pts = isCorrect ? currentQ.points : 0;

      answers.push({
        questionId: currentQ._id,
        questionIndex: current,
        selected: selected.map(Number),
        isCorrect,
        pointsEarned: pts,
        usedHelp,
      });
    }

    try {
      const token = await user.getIdToken();
      await axios.post(
        `https://cotc-backend.onrender.com/api/challenges/${id}/submit`,
        { answers, startedAt: startTime },
        { headers: { Authorization: `Bearer ${token}`, email: user.email } }
      );
    } catch {
      console.error("Submit failed");
    } finally {
      clearTimeout(timerRef.current);

      // Stop all audio before navigating
      musicRef.current?.pause();
      correctSoundRef.current?.pause();
      wrongSoundRef.current?.pause();

      navigate(`/cabaran-leaderboard/${id}`);
    }
  };

  // Loading or initial state
  if (!challenge) return <p>Sedang memuatkan...</p>;

  // ─── Start Confirmation Screen ───
  if (!hasStarted) {
    return (
      <div className={styles.dashboardContainer}>
        <h2>{challenge.title}</h2>
        <p>{challenge.description}</p>
        <p><strong>Durasi:</strong> {challenge.duration} minit</p>
        <p><strong>Jumlah Soalan:</strong> {challenge.questions.length}</p>
        <button
          className={styles.profileSaveButton}
          onClick={async () => {
            try {
              const token = await auth.currentUser.getIdToken();
              const res = await axios.get(`https://cotc-backend.onrender.com/api/challenges/${id}/leaderboard`, {
                headers: { Authorization: `Bearer ${token}`, email: auth.currentUser.email },
              });

              const alreadyAttempted = res.data.some(
                (entry) => entry.studentName === auth.currentUser.email // Or compare against username if consistent
              );

              if (alreadyAttempted) {
                alert("Anda telah menyertai cabaran ini. Anda tidak boleh sertai semula.");
                return;
              }

              setHasStarted(true);
              setIsUnMuted(true);
            } catch (err) {
              alert("Gagal memeriksa status cabaran.");
            }
          }}
        >
          🚀 Mula Cabaran
        </button>
      </div>
    );
  }

  if (!q) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className={styles.dashboardContainer}>
      <audio ref={musicRef} src={bgMusic} />
      <audio ref={correctSoundRef} src={correctSoundSrc} />
      <audio ref={wrongSoundRef} src={wrongSoundSrc} />

      <div className={styles.challengeHeader}>
        <h2>{challenge.title}</h2>
        <div><strong>Masa:</strong> {minutes}:{seconds}</div>
        <div><strong>Soalan:</strong> {current + 1}/{challenge.questions.length}</div>
        <div><strong>Skor:</strong> {score}</div>
        <button className={styles.musicToggle} onClick={() => setIsUnMuted(!unMuted)}>
          {unMuted ? "🔊 Senyap Muzik" : "🔇 Buka Muzik"}

        </button>
      </div>

      <div className={styles.questionCard}>
        <p className={styles.questionText}>{q.text}</p>

        {multipleExpected && (
          <p className={styles.selectNote}>📌 Pilih {q.correct.length} jawapan</p>
        )}
        {selected.length > q.correct.length && (
          <p className={styles.tooManyWarning}>⚠️ Terlalu banyak jawapan dipilih!</p>
        )}

        <div className={styles.choicesWrapper}>
          {q.choices.map((choice, i) => {
            const isSelected = selected.includes(i);
            const isCorrect = showCorrect && q.correct.includes(i);
            const isWrong = showCorrect && isSelected && !q.correct.includes(i);

            return (
              <button
                key={i}
                disabled={hiddenIndex === i}
                className={`${styles.choiceButton}
                  ${isSelected ? styles.selected : ""}
                  ${isCorrect ? styles.correctAnswer : ""}
                  ${isWrong ? styles.wrongAnswer : ""}
                  ${hiddenIndex === i ? styles.hiddenChoice : ""}`}
                onClick={() => toggleSelect(i)}
              >
                {choice}
              </button>
            );
          })}
        </div>

        <div className={styles.questionActions}>
          <button
            onClick={useHelp}
            disabled={!q.allowHelp || usedHelp || selected.length > 0}
            title={!q.allowHelp ? "Bantuan tidak dibenarkan untuk soalan ini" : ""}
          >
            🧠 Bantuan
          </button>
          <button
            onClick={submitAnswer}
            disabled={selected.length === 0 || feedback != null}
          >
            ✅ Hantar
          </button>
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
