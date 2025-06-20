// src/components/dashboard/StudentDashboard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase-config';
import profileIcon from '../../profileIcon.jpg';
import trophyIcon  from '../../trophyIcon.jpg';
import logoutIcon  from '../../logoutIcon.jpg';
import sideBar     from '../../sideBar.jpg';
import axios       from 'axios';
import styles      from './styles/StudentDashboard.module.css';

const StudentDashboard = () => {
  const navigate = useNavigate();

  // ──────────────────────────────────────────────────────────────────────────
  // 1) Popup / sidebar state
  // ──────────────────────────────────────────────────────────────────────────
  const [showProfile, setShowProfile] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ──────────────────────────────────────────────────────────────────────────
  // 2) “Canonical” profile data (from MongoDB)
  // ──────────────────────────────────────────────────────────────────────────
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    photoURL: '',
  });
  const [loadingProfile, setLoadingProfile] = useState(false);

  // ──────────────────────────────────────────────────────────────────────────
  // 3) “Editable” username + validation error
  // ──────────────────────────────────────────────────────────────────────────
  const [newUsername, setNewUsername] = useState('');
  const [profileError, setProfileError] = useState('');

  // ──────────────────────────────────────────────────────────────────────────
  // 4) Avatar uploads / preview / error
  // ──────────────────────────────────────────────────────────────────────────
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [imageError, setImageError] = useState('');

  // ──────────────────────────────────────────────────────────────────────────
  // 5) LOGOUT
  // ──────────────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (!confirmLogout) {
      // “Cancel” → do nothing, stay on dashboard
      return;
    }
    try {
      await signOut(auth);
      localStorage.removeItem('userRole');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 6) Sidebar toggle
  // ──────────────────────────────────────────────────────────────────────────
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 7) OPEN PROFILE POPUP → ALWAYS RE‐FETCH from GET /api/auth/profile
  // ──────────────────────────────────────────────────────────────────────────
  const handleShowProfile = async () => {
    if (isSidebarOpen || showAchievements) return;

    setShowProfile(true);
    setLoadingProfile(true);
    setProfileError('');
    setShowAvatarOptions(false);
    setAvatarFile(null);
    setAvatarPreview('');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        // (Shouldn’t happen if ProtectedRoute is working)
        setProfileData({ username: '', email: '', photoURL: '' });
        setNewUsername('');
        setLoadingProfile(false);
        return;
      }

      const token = await currentUser.getIdToken();
      const res = await axios.get('/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
          email: currentUser.email
        }
      });

      // Unpack exactly what we returned on the server:
      const { username, email, photoURL } = res.data;
      setProfileData({ username: username || '', email: email || currentUser.email, photoURL: photoURL || '' });
      setNewUsername(username || '');

    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfileData({
        username: '',
        email: auth.currentUser?.email || '',
        photoURL: ''
      });
      setNewUsername('');
    } finally {
      setLoadingProfile(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 8) CLOSE PROFILE → clear errors / unsaved changes
  // ──────────────────────────────────────────────────────────────────────────
  const handleCloseProfile = () => {
    setShowProfile(false);
    setProfileError('');
    setShowAvatarOptions(false);
    setImageError('');
    setNewUsername(profileData.username);  // “revert” in‐place edits
    setAvatarFile(null);
    setAvatarPreview('');
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 9) SHOW/HIDE ACHIEVEMENTS
  // ──────────────────────────────────────────────────────────────────────────
  const handleShowAchievements = () => {
    if (!isSidebarOpen) {
      setShowAchievements(true);
    }
  };
  const handleCloseAchievements = () => {
    setShowAchievements(false);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 10) Sidebar MENU clicks
  // ──────────────────────────────────────────────────────────────────────────
  const handleMenuClick = (menuItem) => {
    if (menuItem === 'Dashboard') {
      navigate('/dashboard');
    } else if (menuItem === 'Tingkatan') {
      navigate('/tingkatan');
    } else if (menuItem === 'Forum') {
      navigate('/forum');
    } else if (menuItem === 'Latihan') {
      navigate('/latihan');
    }else if (menuItem === 'Cabaran') {
      navigate('/cabaran');
    }
    setIsSidebarOpen(false);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 11a) Avatar‐icon click → toggle “≤ Preview | Upload New | Delete ≥”
  // ──────────────────────────────────────────────────────────────────────────
  const handleAvatarClick = () => {
    if (loadingProfile) return;
    setShowAvatarOptions(prev => !prev);
    setImageError('');
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 11b) Preview EXISTING photo
  // ──────────────────────────────────────────────────────────────────────────
  const handlePreviewImage = () => {
    if (!profileData.photoURL) {
      setShowAvatarOptions(false);
      setImageError('No photo to preview.');
      return;
    }
    window.open(profileData.photoURL, '_blank');
    setShowAvatarOptions(false);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 11c) Select NEW avatar file (validate immediately, but do NOT yet send to server)
  // ──────────────────────────────────────────────────────────────────────────
  const handleAvatarFileChange = (e) => {
    setImageError('');
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg','jpeg','png'].includes(ext)) {
      setShowAvatarOptions(false);
      setImageError('Only .jpg, .jpeg, .png allowed.');
      e.target.value = null;
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setShowAvatarOptions(false);
      setImageError('Image size must be under 100 MB.');
      e.target.value = null;
      return;
    }

    // Create a local preview URL (not yet saved to server)
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setAvatarFile(file);
    setShowAvatarOptions(false);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 11d) Delete existing photo on server immediately
  // ──────────────────────────────────────────────────────────────────────────
  const handleDeleteImage = async () => {
    if (!profileData.photoURL) {
      setImageError('No photo to delete.');
      setShowAvatarOptions(false);
      return;
    }
    if (!window.confirm('Delete profile photo?')) {
      return;
    }
    try {
      const currentUser = auth.currentUser;
      const token = await currentUser.getIdToken();
      await axios.delete('/api/auth/profile/photo', {
        headers: {
          Authorization: `Bearer ${token}`,
          email: currentUser.email
        }
      });

      alert('Photo deleted successfully.');
      setProfileData(prev => ({ ...prev, photoURL: '' }));
      setAvatarFile(null);
      setAvatarPreview('');
      setShowAvatarOptions(false);
    } catch (err) {
      console.error('Error deleting photo:', err);
      setImageError('Deletion failed. Please try again.');
      setShowAvatarOptions(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 12) SAVE all changes (username & possibly avatarFile) in one go
  // ──────────────────────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setProfileError('');
    setImageError('');

    // 12a) Validate username
    const trimmed = newUsername.trim();
    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
    if (!trimmed) {
      setProfileError('Username cannot be empty.');
      return;
    }
    if (!usernameRegex.test(trimmed)) {
      setProfileError('3–20 alphanumeric characters only.');
      return;
    }

    try {
      const currentUser = auth.currentUser;
      const token = await currentUser.getIdToken();

      // 12b) If a new avatarFile was picked, upload it now:
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const photoRes = await axios.post(
          '/api/auth/profile/photo',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
              email: currentUser.email
            }
          }
        );
        // update local state with new photoURL from server:
        setProfileData(prev => ({
          ...prev,
          photoURL: photoRes.data.photoURL
        }));
      }

      // 12c) If username changed, call PUT /api/auth/profile:
      if (trimmed !== profileData.username) {
        await axios.put(
          '/api/auth/profile',
          { username: trimmed },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              email: currentUser.email
            }
          }
        );
        setProfileData(prev => ({ ...prev, username: trimmed }));
      }

      alert('Changes updated successfully!');
      handleCloseProfile();
    } catch (err) {
      console.error('Error saving profile:', err);
      if (err.response?.data?.message) {
        // show either the “Only .jpg allowed” or “Username already taken” message
        setImageError(err.response.data.message);
      } else {
        setProfileError('Could not save changes. Please try again.');
      }
      setShowAvatarOptions(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      {isSidebarOpen && (
        <>
          <div className={styles.sidebar}>
            <div
              className={styles.closeSidebar}
              onClick={toggleSidebar}
            >
              ←
            </div>
            <h3 className={styles.sidebarTitle}>Dashboard Menu</h3>
            <ul className={styles.sidebarList}>
              <li onClick={() => handleMenuClick('Dashboard')}>
                Dashboard
              </li>
              <li onClick={() => handleMenuClick('Tingkatan')}>
                Tingkatan
              </li>
              <li onClick={() => handleMenuClick('Forum')}>
                Forum
              </li>
              <li onClick={() => handleMenuClick('Latihan')}>Latihan</li>
              <li onClick={() => handleMenuClick('Cabaran')}>Cabaran</li>
            </ul>
          </div>
          <div className={styles.overlay} onClick={toggleSidebar} />
        </>
      )}

      {/* Sidebar toggle button */}
      {!isSidebarOpen && (
        <div className={styles.sidebarButton}>
          <img
            src={sideBar}
            alt="Sidebar"
            width={45}
            height={45}
            className={styles.iconClickable}
            onClick={toggleSidebar}
          />
        </div>
      )}

      {/* Top‐right icons */}
      <div className={styles.topRightIcons}>
        <img
          src={profileIcon}
          alt="Profile"
          width={45}
          height={45}
          className={`${styles.iconClickable} ${
            isSidebarOpen || showAchievements
              ? styles.disabledIcon
              : ''
          }`}
          onClick={handleShowProfile}
        />
        <img
          src={trophyIcon}
          alt="Achievements"
          width={45}
          height={45}
          className={`${styles.iconClickable} ${
            isSidebarOpen || showProfile
              ? styles.disabledIcon
              : ''
          }`}
          onClick={handleShowAchievements}
        />
        <img
          src={logoutIcon}
          alt="Logout"
          width={50}
          height={45}
          className={styles.iconClickable}
          onClick={handleLogout}
        />
      </div>

      {/* Main content */}
      <div className={styles.mainContent}>
        <h1>Welcome to Student Dashboard</h1>
        <p>You have successfully logged in as a student.</p>

        {/* Achievements popup */}
        {showAchievements && (
          <>
            <div
              className={styles.popupOverlay}
              onClick={handleCloseAchievements}
            />
            <div className={styles.popupBox}>
              <h2>Achievements</h2>
              <button
                onClick={handleCloseAchievements}
                className={styles.closeButton}
              >
                ✖
              </button>
              <table className={styles.achievementTable}>
                <thead>
                  <tr>
                    <th>Competition Name</th>
                    <th>Date Joined</th>
                    <th>Rank</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      colSpan="3"
                      className={styles.noRecord}
                    >
                      No Record Found
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Profile popup */}
        {showProfile && (
          <>
            <div
              className={styles.popupOverlay}
              onClick={handleCloseProfile}
            />
            <div className={styles.popupBox}>
              <h2>My Profile</h2>
              <button
                onClick={handleCloseProfile}
                className={styles.closeButton}
              >
                ✖
              </button>

              {loadingProfile ? (
                <p>Loading…</p>
              ) : (
                <div className={styles.profileContent}>
                  {/* Avatar section */}
                  <div className={styles.avatarSection}>
                    {profileData.photoURL ? (
                      <img
                        src={profileData.photoURL}
                        alt="Avatar"
                        className={styles.profileAvatar}
                        onClick={handleAvatarClick}
                      />
                    ) : (
                      <div
                        className={styles.profileAvatarPlaceholder}
                        onClick={handleAvatarClick}
                      >
                        No Photo
                      </div>
                    )}

                    {/* Avatar Options Menu */}
                    {showAvatarOptions && (
                      <div className={styles.avatarOptions}>
                        <button onClick={handlePreviewImage}>
                          Preview Image
                        </button>
                        <label className={styles.uploadLabel}>
                          Upload New
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={handleAvatarFileChange}
                            className={styles.fileInput}
                          />
                        </label>
                        <button onClick={handleDeleteImage}>
                          Delete Image
                        </button>
                      </div>
                    )}
                    {imageError && (
                      <div className={styles.profileError}>
                        {imageError}
                      </div>
                    )}

                    {/* If user picked a new file, show a local preview */}
                    {avatarPreview && (
                      <img
                        src={avatarPreview}
                        alt="New avatar preview"
                        className={styles.avatarPreview}
                      />
                    )}
                  </div>

                  {/* Editable username + static email */}
                  <div className={styles.profileInfoForm}>
                    <label>
                      <strong>Name:</strong>
                    </label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) =>
                        setNewUsername(e.target.value)
                      }
                      className={styles.profileInput}
                      maxLength={20}
                    />

                    <label>
                      <strong>Email:</strong>
                    </label>
                    <input
                      type="text"
                      value={profileData.email}
                      readOnly
                      className={styles.profileInputReadOnly}
                    />

                    {profileError && (
                      <div
                        className={styles.profileError}
                      >
                        {profileError}
                      </div>
                    )}

                    <div
                      className={styles.profileButtonGroup}
                    >
                      <button
                        onClick={handleSaveProfile}
                        className={styles.profileSaveButton}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCloseProfile}
                        className={styles.profileCancelButton}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
