import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Register.module.css';
import { auth } from '../../firebase-config';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [strength, setStrength] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // Real‑time validation
  useEffect(() => {
    // password strength indicator
    const p = form.password;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[@$!%*#?&]/.test(p)) score++;
    setStrength(score <= 1 ? 'Weak' : score === 2 ? 'Medium' : 'Strong');
  }, [form.password]);
  // Check email address availability
  const validate = () => {
    const e = {};
    if (!usernameRegex.test(form.username)) e.username = '3–20 alphanumeric chars';
    if (!emailRegex.test(form.email)) e.email = 'Invalid email format';
    if (!passwordRegex.test(form.password)) e.password = 'Min 8 chars, incl. letter, number & special';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  // create user
  // store in mongo db
  // send verify email

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    let firebaseUser = null;

    try {

      // 1. Create user in Firebase
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          form.email,
          form.password
        );
        firebaseUser = userCredential.user;
        await sendEmailVerification(firebaseUser);
        console.log('✅ Firebase account created! Verification email sent.');
      } catch (firebaseError) {
        console.error('Firebase error:', firebaseError);
        setErrors({ api: firebaseError.message });
        return; // Exit if Firebase failed
      }

      // 3. Send user info to backend
      try {
        await axios.post('https://cotc-backend.onrender.com/api/auth/register', {
          username: form.username,
          email: form.email,
          firebaseUid: firebaseUser.uid,
          role: 'student',
        });
        // 4. Notify and redirect
      window.alert(
        'Registration successful! Please check your email to verify your account.'
      );
      navigate('/login');
      } catch (mongoError) {
        // Don't remove success msg, just show error below it
        setErrors({ api: 'Note: Firebase account created, but saving to database failed.' });
        console.error('MongoDB error:', mongoError);
      }

      setForm({ username: '', email: '', password: '' });
      // navigate('/verify-otp', { state: form });
    } catch (err) {
      setErrors({ api: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.backButton}
        onClick={() => navigate('/login')}
      >
        ← Back
      </button>

      <div className={styles.container}>
        <h2>New User Registration</h2>
        {errors.api && <div className={styles.error}>{errors.api}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="username"
            />
            {errors.username && <small className={styles.fieldError}>{errors.username}</small>}
          </div>

          <div className={styles.field}>
            <label>Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="student@gmail.com"
            />
          {errors.email && <small className={styles.fieldError}>{errors.email}</small>}
          </div>

          <div className={styles.field}>
            <label>Password</label>
            <div className={styles.pwdWrapper}>
              <input
                type={showPwd ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <button
                type="button"
                className={styles.toggle}
                onClick={() => setShowPwd(s => !s)}
              >
                {showPwd ? 'Hide' : 'Show'}
              </button>
            </div>
            <small className={styles.strength}>Strength: {strength}</small>
            {errors.password && (
              <small className={styles.fieldError}>{errors.password}</small>
            )}
          </div>

          <button type="submit" className={styles.button}>
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
