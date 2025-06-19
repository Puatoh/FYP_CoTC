import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../firebase-config';
import styles from './styles/ForgetPasswordForm.module.css';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminMode = location.pathname.includes('/admin');

  const handleBack = () => {
    navigate(isAdminMode ? '/login/admin' : '/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Check your email inbox to verify and reset your password!');
      navigate(isAdminMode ? '/login/admin' : '/login'); // Redirect based on mode
    } catch (error) {
      alert('Error sending reset email. Please check your email address.');
    }
  };

  return (
    <div className={styles.forgetPasswordContainer}>
      <h2>Reset Your Password</h2>
      <p className={styles.instructionText}>
        Please enter your registered email to reset your password.
      </p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email here"
          className={styles.emailInput}
          required
        />
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>
            Submit
          </button>
          <button type="button" onClick={handleBack} className={styles.backButton}>
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgetPassword;
