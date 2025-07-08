// src/components/dashboard/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase-config';
import profileIcon from '../../profileIcon.jpg';
import logoutIcon from '../../logoutIcon.jpg';
import sideBar from '../../sideBar.jpg';
import axios from 'axios';
import styles from './styles/StudentDashboard.module.css'; // Reuse same CSS

const AdminDashboard = () => {
  const navigate = useNavigate();

  // ──────────────────────────────────────────────────────────────────────────
  // 1) Popup / sidebar state
  // ──────────────────────────────────────────────────────────────────────────
  const [showProfile, setShowProfile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentError, setStudentError] = useState('');
  const [forumUpdates, setForumUpdates] = useState([]);
  const [loadingForum, setLoadingForum] = useState(true);
  const [forumError, setForumError] = useState('');

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
      navigate('/login/admin');
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
    // If sidebar is open, do nothing
    if (isSidebarOpen) return;

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
          email: currentUser.email,
        },
      });

      const { username, email, photoURL } = res.data;
      setProfileData({
        username: username || '',
        email: email || currentUser.email,
        photoURL: photoURL || '',
      });
      setNewUsername(username || '');
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfileData({
        username: '',
        email: auth.currentUser?.email || '',
        photoURL: '',
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
    // Discard unsaved username and avatarFile
    setNewUsername(profileData.username);
    setAvatarFile(null);
    setAvatarPreview('');
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 9) Sidebar MENU clicks
  // ──────────────────────────────────────────────────────────────────────────
  const handleMenuClick = menuItem => {
    if (menuItem === 'Dashboard') {
      navigate('/dashboard/admin');
    } else if (menuItem === 'Tingkatan') {
      navigate('/tingkatan/admin');
    } else if (menuItem === 'Forum') {
      navigate('/forum/admin');
    } else if (menuItem === 'Latihan') {
      navigate('/latihan/admin');
    } else if (menuItem === 'Cabaran') {
      navigate('/cabaran/admin');
    }
    setIsSidebarOpen(false);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 10a) Avatar‐icon click → toggle “≤ Preview | Upload New | Delete ≥”
  // ──────────────────────────────────────────────────────────────────────────
  const handleAvatarClick = () => {
    if (loadingProfile) return;
    setShowAvatarOptions(prev => !prev);
    setImageError('');
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 10b) Preview EXISTING photo
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
  // 10c) Select NEW avatar file (validate immediately, but do NOT yet send to server)
  // ──────────────────────────────────────────────────────────────────────────
  const handleAvatarFileChange = e => {
    setImageError('');
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png'].includes(ext)) {
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
  // 10d) Delete EXISTING photo on server immediately
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
          email: currentUser.email,
        },
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
  // 11) SAVE ALL CHANGES (username & possibly avatarFile) in one go
  // ──────────────────────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setProfileError('');
    setImageError('');

    // Validate username
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

      // 11a) If a new avatarFile was picked, upload it now
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
              email: currentUser.email,
            },
          }
        );
        // Immediately update local state with new URL
        setProfileData(prev => ({
          ...prev,
          photoURL: photoRes.data.photoURL,
        }));
      }

      // 11b) If username changed, update it
      if (trimmed !== profileData.username) {
        await axios.put(
          '/api/auth/profile',
          { username: trimmed },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              email: currentUser.email,
            },
          }
        );
        setProfileData(prev => ({ ...prev, username: trimmed }));
      }

      alert('Perubahan berjaya dikemas kini!');
      handleCloseProfile();
    } catch (err) {
      console.error('Error saving profile:', err);
      if (err.response?.data?.message) {
        // Show either “Username already taken” or “Only .jpg allowed”
        setImageError(err.response.data.message);
      } else {
        setProfileError('Could not save changes. Please try again.');
      }
      setShowAvatarOptions(false);
    }
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const currentUser = auth.currentUser;
        const token = await currentUser.getIdToken();

        const res = await axios.get('/api/admin/students', {
          headers: {
            Authorization: `Bearer ${token}`,
            email: currentUser.email,
          },
        });
        setStudents(res.data);
      } catch (err) {
        console.error('Error fetching students:', err);
        setStudentError('Failed to fetch student list.');
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();

    const fetchForumUpdates = async () => {
      try {
        const currentUser = auth.currentUser;
        const token = await currentUser.getIdToken();

        const res = await axios.get('/api/forum-tingkatan-1/activity', {
          headers: {
            Authorization: `Bearer ${token}`,
            email: currentUser.email,
          },
        });
        setForumUpdates(res.data);
      } catch (err) {
        console.error('Error fetching forum activity:', err);
        setForumError('Failed to fetch forum activity.');
      } finally {
        setLoadingForum(false);
      }
    };

    fetchForumUpdates();
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      {isSidebarOpen && (
        <>
          <div className={styles.sidebar}>
            <div className={styles.closeSidebar} onClick={toggleSidebar}>
              ←
            </div>
            <h3 className={styles.sidebarTitle}>Dashboard Menu</h3>
            <ul className={styles.sidebarList}>
              <li onClick={() => handleMenuClick('Dashboard')}>Dashboard</li>
              <li onClick={() => handleMenuClick('Tingkatan')}>Tingkatan</li>
              <li onClick={() => handleMenuClick('Forum')}>Forum</li>
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

      {/* Top-right icons */}
      <div className={styles.topRightIcons}>
        <img
          src={profileIcon}
          alt="Profile"
          width={45}
          height={45}
          className={`${styles.iconClickable} ${isSidebarOpen ? styles.disabledIcon : ''
            }`}
          onClick={handleShowProfile}
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
        <h1>Selamat datang ke Papan Pemuka Admin</h1>
        <p>Anda telah berjaya log masuk sebagai admin.</p>
      </div>

      <h2>Senarai Pelajar Berdaftar</h2>
      {loadingStudents ? (
        <p>Loading students…</p>
      ) : studentError ? (
        <p className={styles.profileError}>{studentError}</p>
      ) : (
        <table className={styles.studentTable}>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Selesai Latihan</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={index}>
                <td>{student.username}</td>
                <td>{student.email}</td>
                <td>{student.exerciseStats}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Aktiviti Forum Terkini</h2>
      {loadingForum ? (
        <p>Loading forum activity…</p>
      ) : forumError ? (
        <p className={styles.profileError}>{forumError}</p>
      ) : forumUpdates.length === 0 ? (
        <p>No recent activity.</p>
      ) : (
        <ul className={styles.activityList}>
          {forumUpdates.map((item, idx) => (
            <li key={idx} className={styles.activityItem}>
              <strong>{item.type}</strong> oleh <em>{item.authorUsername}</em>:&nbsp;
              <span>
                {item.content.length > 100 ? item.content.slice(0, 100) + '…' : item.content}
              </span>
              <div className={styles.timestamp}>
                {new Date(item.createdAt).toLocaleString()}
              </div>
              {item.topicId && (
                <div className={styles.topicLink}>
                  Topik: {item.topicTitle}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Profile popup */}
      {showProfile && (
        <>
          <div className={styles.popupOverlay} onClick={handleCloseProfile} />
          <div className={styles.popupBox}>
            <h2>Profil Saya</h2>
            <button onClick={handleCloseProfile} className={styles.closeButton}>
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
                      <button onClick={handlePreviewImage}>Preview Image</button>
                      <label className={styles.uploadLabel}>
                        Upload New
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={handleAvatarFileChange}
                          className={styles.fileInput}
                        />
                      </label>
                      <button onClick={handleDeleteImage}>Delete Image</button>
                    </div>
                  )}
                  {imageError && (
                    <div className={styles.profileError}>{imageError}</div>
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
                    <strong>Nama:</strong>
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
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
                    <div className={styles.profileError}>{profileError}</div>
                  )}

                  <div className={styles.profileButtonGroup}>
                    <button
                      onClick={handleSaveProfile}
                      className={styles.profileSaveButton}
                    >
                      Simpan
                    </button>
                    <button
                      onClick={handleCloseProfile}
                      className={styles.profileCancelButton}
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
