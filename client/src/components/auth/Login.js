// src/components/auth/Login.js
import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { auth } from '../../firebase-config';
import styles from './styles/Login.module.css';
import logoCoTC from '../../logoCoTC.png';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  // Determine whether we're on the student side or admin side
  const isAdminMode = location.pathname === '/login/admin';

  // form holds the values: { email, password }
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  // Whenever the mode (student vs admin) changes, load any stored credentials
  useEffect(() => {
    const key= isAdminMode ? 'credentials_admin' : 'credentials_student';
    const saved = localStorage.getItem(key );
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.email && parsed.password) {
          setForm(parsed);
          setRememberMe(true);
        } else {
          setForm({ email: '', password: '' });
          setRememberMe(false);
        }
      } catch {
        setForm({ email: '', password: '' });
        setRememberMe(false);
      }
    } else {
      setForm({ email: '', password: '' });
      setRememberMe(false);
    }
  }, [isAdminMode]);

  // Whenever the user changes a field, update state—and if rememberMe, save immediately
  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);

    if (rememberMe) {
      // Persist under the appropriate key
      const key= isAdminMode ? 'credentials_admin' : 'credentials_student';
      localStorage.setItem(key , JSON.stringify(updated));
    }
  };

  // When toggling “Remember Me,” either save or remove from localStorage
  const handleRememberChange = (e) => {
    const checked = e.target.checked;
    setRememberMe(checked);

    const key= isAdminMode ? 'credentials_admin' : 'credentials_student';
    if (checked) {
      // Save current form values (even if empty, but typically not empty)
      localStorage.setItem(key , JSON.stringify(form));
    } else {
      // Remove stored credentials
      localStorage.removeItem(key );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Clear any previous role
    localStorage.removeItem('userRole');

    try {
      // 1) Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;

      // 2) Check email verification
      if (!user.emailVerified) {
        setError('Please verify your email before logging in.');
        return;
      }

      // 3) Sync "isVerified" in MongoDB
      await axios.post('/api/auth/login', {
        email: user.email,
        firebaseUid: user.uid,
        markVerified: true,
      });

      // 4) Fetch role/username from backend
      const res = await axios.post('/api/auth/login', { email: form.email });
      const { username, role } = res.data;

      // 5) Store role in localStorage for ProtectedRoute
      localStorage.setItem('userRole', role);
      alert(`Hi, ${username}!`);

      // 6) Redirect to the correct dashboard
      if (role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard');
      }

      // Only clear the form if they did NOT ask to “remember” themselves
      if (!rememberMe) {
        setForm({ email: '', password: '' });
      }
    } catch (err) {
      setError('Invalid credentials');
      // If login fails, do not overwrite localStorage if rememberMe was checked
    }
  };

  // Toggle between student vs admin login pages
  const handleImageDoubleClick = () => {
    setForm({ email: '', password: '' });
    setRememberMe(false);
    // Remove any stored credential for the previous mode
    const oldKey = isAdminMode ? 'credentials_admin' : 'credentials_student';
    localStorage.removeItem(oldKey);
    // Switch route
    navigate(isAdminMode ? '/login' : '/login/admin');
  };

  const handleForgotPassword = () => {
    navigate('/forget-password');
  };

  return (
    <div className={styles.container}>
      <img
        src={logoCoTC}
        alt="Toggle Admin/Student"
        className={styles.photo}
        width={200}
        height={200}
        onDoubleClick={handleImageDoubleClick}
      />

      <h2>{isAdminMode ? 'Admin Login' : 'Student Login'}</h2>
      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder={isAdminMode ? 'admin@gmail.com' : 'student@gmail.com'}
            required
          />
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
              required
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className={styles.toggle}
            >
              {showPwd ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className={styles.actions}>
          <label className={styles.remember}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={handleRememberChange}
            />{' '}
            Remember Me
          </label>
          <button
            type="button"
            className={styles.forgot}
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>
        </div>

        <button type="submit" className={styles.button}>
          Log In
        </button>

        <div className={styles.registerPrompt}>
          {isAdminMode ? (
            <>
              <span>New Admin? </span>
              <Link to="/register/admin" className={styles.registerLink}>
                Register here
              </Link>
            </>
          ) : (
            <>
              <span>New user? </span>
              <Link to="/register" className={styles.registerLink}>
                Register here
              </Link>
            </>
          )}
        </div>
      </form>
    </div>
  );
}