import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './styles/AdminRegister.module.css';
import { auth } from '../../firebase-config';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

export default function AdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [strength, setStrength] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // Password strength meter
  useEffect(() => {
    let score = 0;
    if (form.password.length >= 8) score++;
    if (/[A-Z]/.test(form.password) && /[a-z]/.test(form.password)) score++;
    if (/\d/.test(form.password)) score++;
    if (/[@$!%*#?&]/.test(form.password)) score++;
    setStrength(score <= 1 ? 'Weak' : score === 2 ? 'Medium' : 'Strong');
  }, [form.password]);

  // Field validation
  const validate = () => {
    const e = {};
    if (!usernameRegex.test(form.username)) e.username = '3–20 alphanumeric chars';
    if (!emailRegex.test(form.email)) e.email = 'Invalid email format';
    if (!passwordRegex.test(form.password))
      e.password = 'Min 8 chars, incl. letter, number & special';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      // 1. Firebase account + email verification
      const { user } = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      await sendEmailVerification(user);

      // 2. Save to MongoDB with role='admin'
      await axios.post('/api/auth/register', {
        username: form.username,
        email: form.email,
        firebaseUid: user.uid,
        role: 'admin'
      });

      // 3. Notify and redirect
      window.alert(
        'Registration successful! Please check your email to verify your account.'
      );
      navigate('/login/admin');
    } catch (err) {
      console.error(err);
      setErrors({
        api: err.response?.data?.message || err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.backButton}
        onClick={() => navigate('/login/admin')}
      >
        ← Back
      </button>

      <h2>New Admin Registration</h2>
      {errors.api && <div className={styles.error}>{errors.api}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>AdminName</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="CoTC_Admin"
          />
          {errors.username && <small className={styles.fieldError}>{errors.username}</small>}
        </div>

        <div className={styles.field}>
          <label>Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="admin@gmail.com"
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

        <button
          type="submit"
          className={styles.button}
          disabled={loading}
        >
          {loading ? 'Registering…' : 'Register'}
        </button>
      </form>
    </div>
  );
}
