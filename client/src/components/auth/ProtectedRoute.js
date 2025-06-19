// src/components/auth/ProtectedRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../../firebase-config';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();

  // If the URL contains "/admin", treat this as admin mode:
  const isAdminMode = location.pathname.includes('/admin');

  useEffect(() => {
    // Subscribe to Firebase authentication state
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // 1) If not logged in or email not verified → redirect to student or admin login:
  if (!user || !user.emailVerified) {
    // send admins to "/login/admin", everyone else to "/login"
    const redirectPath = isAdminMode ? '/login/admin' : '/login';
    return <Navigate to={redirectPath} replace />;
  }

  // Read the stored role from localStorage
  const userRole = localStorage.getItem('userRole');

  // 2) If requiredRole is explicitly passed (e.g. "admin" or "student"), enforce it:
  if (requiredRole) {
    if (userRole !== requiredRole) {
      // Wrong role → always send to /login
      return <Navigate to="/dashboard" replace />;
    }
    // Right role → allow
    return children;
  }

  // 3) If no requiredRole was passed, we treat this as a "student‐only" route.
  //    In other words, if an admin is logged in and tries to hit a student route,
  //    we bounce them to their own admin dashboard instead of letting them stay here.
  if (!requiredRole && userRole === 'admin') {
    return <Navigate to="/dashboard/admin" replace />;
  }

  // Otherwise (userRole === 'student'), allow
  return children;
};

export default ProtectedRoute;
