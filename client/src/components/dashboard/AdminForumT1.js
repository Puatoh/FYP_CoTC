// src/components/dashboard/AdminForumT1.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase-config';
import axios from 'axios';
import styles from './styles/StudentDashboard.module.css';

const AdminForumT1 = () => {
  const navigate = useNavigate();

  // ─────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [topicForm, setTopicForm] = useState({ title: '', description: '' });
  const [topicError, setTopicError] = useState('');

  // Comments state keyed by topicId
  const [commentsByTopic, setCommentsByTopic] = useState({});
  const [newCommentByTopic, setNewCommentByTopic] = useState({});
  const [commentErrorByTopic, setCommentErrorByTopic] = useState({});
  const [repliesByComment, setRepliesByComment] = useState({});
  const [newReplyByComment, setNewReplyByComment] = useState({});
  const [replyErrorByComment, setReplyErrorByComment] = useState({});
  const [showReplyForComment, setShowReplyForComment] = useState({});
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editedReplyContent, setEditedReplyContent] = useState('');

  // Current user’s email
  const currentEmail = auth.currentUser?.email || '';

  // ─────────────────────────────────────────────────────────────────
  // FETCH TOPICS (on mount)
  // ─────────────────────────────────────────────────────────────────
  const fetchTopics = async () => {
    try {
      setLoadingTopics(true);
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get('/api/forum-tingkatan-1', {
        headers: {
          Authorization: `Bearer ${token}`,
          email: currentEmail
        }
      });
      setTopics(res.data);
      setLoadingTopics(false);
    } catch (err) {
      console.error('Error fetching topics:', err);
      setLoadingTopics(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // CREATE NEW TOPIC (admins only)
  // ─────────────────────────────────────────────────────────────────
  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    setTopicError('');
    const { title, description } = topicForm;

    if (!title.trim() || !description.trim()) {
      setTopicError('Both title and description are required.');
      return;
    }

    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(
        '/api/forum-tingkatan-1',
        { title: title.trim(), description: description.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            email: currentEmail
          }
        }
      );
      // Clear form, refetch
      setTopicForm({ title: '', description: '' });
      fetchTopics();
    } catch (err) {
      console.error('Error creating topic:', err);
      setTopicError(
        err.response?.data?.message || 'Could not create topic. Try again.'
      );
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // FETCH COMMENTS FOR A TOPIC
  // ─────────────────────────────────────────────────────────────────
  const fetchComments = async (topicId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get(
        `/api/forum-tingkatan-1/${topicId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            email: currentEmail
          }
        }
      );
      setCommentsByTopic((prev) => ({
        ...prev,
        [topicId]: res.data
      }));
      return res.data;
    } catch (err) {
      console.error(`Error fetching comments for ${topicId}:`, err);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // ADD COMMENT (any logged-in user)
  // ─────────────────────────────────────────────────────────────────
  const handleCommentSubmit = async (topicId) => {
    const content = newCommentByTopic[topicId]?.trim() || '';
    if (!content) {
      setCommentErrorByTopic((prev) => ({
        ...prev,
        [topicId]: 'Comment cannot be empty.'
      }));
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(
        `/api/forum-tingkatan-1/${topicId}/comments`,
        { content },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            email: currentEmail
          }
        }
      );
      // Clear the new‐comment field, re‐fetch comments
      setNewCommentByTopic((prev) => ({ ...prev, [topicId]: '' }));
      setCommentErrorByTopic((prev) => ({ ...prev, [topicId]: '' }));
      fetchComments(topicId);
    } catch (err) {
      console.error(`Error adding comment to ${topicId}:`, err);
      setCommentErrorByTopic((prev) => ({
        ...prev,
        [topicId]:
          err.response?.data?.message || 'Could not post comment. Try again.'
      }));
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // UPDATE COMMENT (author only)
  // ─────────────────────────────────────────────────────────────────
  const handleUpdateComment = async (topicId, commentId, newContent) => {
    if (!newContent.trim()) return; // no‐op if empty
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.put(
        `/api/forum-tingkatan-1/${topicId}/comments/${commentId}`,
        { content: newContent.trim() },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            email: currentEmail
          }
        }
      );
      fetchComments(topicId);
    } catch (err) {
      console.error(`Error updating comment ${commentId}:`, err);
      // (for simplicity, we don’t display an inline error here)
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // DELETE COMMENT (author only)
  // ─────────────────────────────────────────────────────────────────
  const handleDeleteComment = async (topicId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(
        `/api/forum-tingkatan-1/${topicId}/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            email: currentEmail
          }
        }
      );
      fetchComments(topicId);
    } catch (err) {
      console.error(`Error deleting comment ${commentId}:`, err);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // EDIT TOPIC (admin only) – inline editing
  // ─────────────────────────────────────────────────────────────────
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editedTopicForm, setEditedTopicForm] = useState({
    title: '',
    description: ''
  });
  const [topicEditError, setTopicEditError] = useState('');

  const startEditTopic = (topic) => {
    setEditingTopicId(topic._id);
    setEditedTopicForm({
      title: topic.title,
      description: topic.description
    });
    setTopicEditError('');
  };

  const handleTopicEditSubmit = async (topicId) => {
    const { title, description } = editedTopicForm;
    if (!title.trim() || !description.trim()) {
      setTopicEditError('Title and description cannot be empty.');
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.put(
        `/api/forum-tingkatan-1/${topicId}`,
        { title: title.trim(), description: description.trim() },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            email: currentEmail
          }
        }
      );
      setEditingTopicId(null);
      fetchTopics();
    } catch (err) {
      console.error(`Error editing topic ${topicId}:`, err);
      setTopicEditError(
        err.response?.data?.message || 'Could not update topic. Try again.'
      );
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // DELETE TOPIC (admin only)
  // ─────────────────────────────────────────────────────────────────
  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Delete this topic?')) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(`/api/forum-tingkatan-1/${topicId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          email: currentEmail
        }
      });
      // Also remove its comments locally
      setCommentsByTopic((prev) => {
        const copy = { ...prev };
        delete copy[topicId];
        return copy;
      });
      fetchTopics();
    } catch (err) {
      console.error(`Error deleting topic ${topicId}:`, err);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // FETCH REPLIES FOR A COMMENT
  // ─────────────────────────────────────────────────────────────────
  const fetchReplies = async (topicId, commentId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get(
        `/api/forum-tingkatan-1/${topicId}/comments/${commentId}/replies`,
        { headers: { Authorization: `Bearer ${token}`, email: currentEmail } }
      );
      setRepliesByComment(prev => ({
        ...prev,
        [commentId]: res.data
      }));
    } catch (err) {
      console.error(`Error fetching replies for ${commentId}:`, err);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // ADD REPLY
  // ─────────────────────────────────────────────────────────────────
  const handleReplySubmit = async (topicId, commentId) => {
    const content = newReplyByComment[commentId]?.trim() || '';
    if (!content) {
      setReplyErrorByComment(prev => ({
        ...prev,
        [commentId]: 'Reply cannot be empty.'
      }));
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(
        `/api/forum-tingkatan-1/${topicId}/comments/${commentId}/replies`,
        { content },
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, email: currentEmail } }
      );
      setNewReplyByComment(prev => ({ ...prev, [commentId]: '' }));
      setReplyErrorByComment(prev => ({ ...prev, [commentId]: '' }));
      await fetchReplies(topicId, commentId);

      // **NEW: show the replies panel immediately**
      setShowReplyForComment(prev => ({
        ...prev,
        [commentId]: true
      }));
    } catch (err) {
      console.error(`Error adding reply to ${commentId}:`, err);
      setReplyErrorByComment(prev => ({
        ...prev,
        [commentId]: err.response?.data?.message || 'Could not post reply.'
      }));
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // UPDATE REPLY
  // ─────────────────────────────────────────────────────────────────
  const handleUpdateReply = async (topicId, commentId, replyId, newContent) => {
    if (!newContent.trim()) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.put(
        `/api/forum-tingkatan-1/${topicId}/comments/${commentId}/replies/${replyId}`,
        { content: newContent.trim() },
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, email: currentEmail } }
      );
      setEditingReplyId(null);
      fetchReplies(topicId, commentId);
    } catch (err) {
      console.error(`Error updating reply ${replyId}:`, err);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // DELETE REPLY
  // ─────────────────────────────────────────────────────────────────
  const handleDeleteReply = async (topicId, commentId, replyId) => {
    if (!window.confirm('Delete this reply?')) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(
        `/api/forum-tingkatan-1/${topicId}/comments/${commentId}/replies/${replyId}`,
        { headers: { Authorization: `Bearer ${token}`, email: currentEmail } }
      );
      fetchReplies(topicId, commentId);
    } catch (err) {
      console.error(`Error deleting reply ${replyId}:`, err);
    }
  };

  const handleBack = () => {
    navigate('/forum/admin');
  };

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.dashboardContainer}>
      <button className={styles.backButton} onClick={handleBack}>← Back</button>
      <div className={styles.mainContent}>
        <h1>Forum – Tingkatan 1 (Admin + Comments)</h1>

        {/* ─────────────────────────────────────────────────────────────
            1) CREATE NEW TOPIC (Admin‐only)
        ───────────────────────────────────────────────────────────── */}
        <section className={styles.formSection}>
          <h2>Create New Topic</h2>
          <form onSubmit={handleTopicSubmit} className={styles.smallForm}>
            <div className={styles.field}>
              <label>Title</label>
              <input
                type="text"
                value={topicForm.title}
                onChange={(e) =>
                  setTopicForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Topic title"
                required
                className={styles.profileInput}
              />
            </div>
            <div className={styles.field}>
              <label>Description</label>
              <textarea
                value={topicForm.description}
                onChange={(e) =>
                  setTopicForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Describe this topic..."
                required
                className={styles.profileInput}
                rows={3}
              />
            </div>
            {topicError && <div className={styles.profileError}>{topicError}</div>}
            <button type="submit" className={styles.profileSaveButton}>
              Create Topic
            </button>
          </form>
        </section>

        {/* If no topics, show prompt */}
        {loadingTopics ? (
          <p>Loading topics…</p>
        ) : topics.length === 0 ? (
          <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
            No topics yet. Create the first one above.
          </p>
        ) : (
          /* ───────────────────────────────────────────────────────────
             2) LIST ALL TOPICS
          ─────────────────────────────────────────────────────────── */
          topics.map((topic) => (
            <div key={topic._id} className={styles.forumTopicCard}>
              {/** If editing this topic … **/}
              {editingTopicId === topic._id ? (
                <div className={styles.smallForm}>
                  <input
                    type="text"
                    value={editedTopicForm.title}
                    onChange={(e) =>
                      setEditedTopicForm((f) => ({ ...f, title: e.target.value }))
                    }
                    className={styles.profileInput}
                  />
                  <textarea
                    value={editedTopicForm.description}
                    onChange={(e) =>
                      setEditedTopicForm((f) => ({
                        ...f,
                        description: e.target.value
                      }))
                    }
                    className={styles.profileInput}
                    rows={2}
                  />
                  {topicEditError && (
                    <div className={styles.profileError}>{topicEditError}</div>
                  )}
                  <button
                    onClick={() => handleTopicEditSubmit(topic._id)}
                    className={styles.profileSaveButton}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingTopicId(null)}
                    className={styles.profileCancelButton}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <h3>{topic.title}</h3>
                  <p>{topic.description}</p>
                  <small>
                    Last updated:{' '}
                    {new Date(topic.updatedAt).toLocaleString()}
                  </small>

                  {/** Show Edit/Delete buttons if current user is admin (we assume admin created it) **/}
                  {currentEmail && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <button
                        onClick={() => startEditTopic(topic)}
                        className={styles.smallButton}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(topic._id)}
                        className={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}

              {/** ─────────────────────────────────────────────────────────
                  3) COMMENT SECTION FOR THIS TOPIC
              ────────────────────────────────────────────────────────── */}
              <div className={styles.commentSection}>
                <h4>Comments</h4>
                {/* If comments not yet loaded, fetch on demand (also fetch replies for each) */}
                <button
                  className={styles.smallButton}
                  onClick={async () => {
                    // 1) re-fetch comments AND get them back directly
                    const cms = await fetchComments(topic._id) || [];
                    // 2) fetch replies for each, so the “Show Replies” toggle is available
                    cms.forEach(cmt => {
                      fetchReplies(topic._id, cmt._id);
                    });
                  }}
                >
                  Refresh Comments
                </button>

                {/** If there are comments loaded for this topic, list them */}
                <ul className={styles.commentList}>
                  {(commentsByTopic[topic._id] || []).map((cmt) => (
                    <li key={cmt._id} className={styles.commentItem}>
                      <div>
                        <strong>{cmt.authorUsername}</strong> said:
                      </div>
                      <div className={styles.commentContent}>
                        {cmt.authorEmail === currentEmail ? (
                          <EditableComment
                            initialContent={cmt.content}
                            onSave={newText => handleUpdateComment(topic._id, cmt._id, newText)}
                            onDelete={() => handleDeleteComment(topic._id, cmt._id)}
                          />
                        ) : (
                          <span>{cmt.content}</span>
                        )}
                      </div>
                      <small>{new Date(cmt.updatedAt).toLocaleString()}</small>
                      {/* ────────────── REPLY & SHOW REPLIES ────────────── */}
                      <div className={styles.replyControls}>
                        { /* Only show “Show/Hide Replies” if we’ve already fetched and there is at least one reply */}
                        {Array.isArray(repliesByComment[cmt._id]) && repliesByComment[cmt._id].length > 0 && (
                          <button
                            className={styles.replyButton}
                            onClick={() => {
                              setShowReplyForComment(prev => ({
                                ...prev,
                                [cmt._id]: !prev[cmt._id]
                              }));
                              if (!showReplyForComment[cmt._id]) {
                                fetchReplies(topic._id, cmt._id);
                              }
                            }}
                          >
                            {showReplyForComment[cmt._id] ? 'Hide Replies' : 'Show Replies'}
                          </button>
                        )}

                        { /* Always show “Reply” to open/close the reply form */}
                        <button
                          className={styles.replyButton}
                          onClick={() =>
                            setRepliesByComment(prev => ({
                              ...prev,
                              [`replyForm_${cmt._id}`]: !prev[`replyForm_${cmt._id}`]
                            }))
                          }
                        >
                          {repliesByComment[`replyForm_${cmt._id}`] ? 'Cancel Reply' : 'Reply'}
                        </button>
                      </div>


                      {/** Reply Form **/}
                      {repliesByComment[`replyForm_${cmt._id}`] && (
                        <div className={styles.replyForm}>
                          <textarea
                            rows={2}
                            className={styles.profileInput}
                            placeholder="Write your reply..."
                            value={newReplyByComment[cmt._id] || ''}
                            onChange={e =>
                              setNewReplyByComment(prev => ({
                                ...prev,
                                [cmt._id]: e.target.value
                              }))
                            }
                          />
                          {replyErrorByComment[cmt._id] && (
                            <div className={styles.profileError}>
                              {replyErrorByComment[cmt._id]}
                            </div>
                          )}
                          <button
                            className={styles.profileSaveButton}
                            onClick={() => handleReplySubmit(topic._id, cmt._id)}
                          >
                            Post Reply
                          </button>
                        </div>
                      )}

                      {/** Nested Replies **/}
                      {showReplyForComment[cmt._id] && (
                        <ul className={styles.replyList}>
                          {(repliesByComment[cmt._id] || []).map((rpl, idx) => (
                            <li
                              key={rpl._id}
                              className={`${styles.replyItem} ${styles[`nestedLevel${(idx % 3) + 1}`]
                                }`}
                            >
                              <div>
                                <strong>{rpl.authorUsername}</strong> replied:
                              </div>
                              <div className={styles.commentContent}>
                                {editingReplyId === rpl._id ? (
                                  <>
                                    <textarea
                                      rows={2}
                                      className={styles.profileInput}
                                      value={editedReplyContent}
                                      onChange={e => setEditedReplyContent(e.target.value)}
                                    />
                                    <button
                                      className={styles.profileSaveButton}
                                      onClick={() => handleUpdateReply(topic._id, cmt._id, rpl._id, editedReplyContent)}
                                    >
                                      Save
                                    </button>
                                    <button
                                      className={styles.profileCancelButton}
                                      onClick={() => setEditingReplyId(null)}
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <span>{rpl.content}</span>
                                    {rpl.authorEmail === currentEmail && (
                                      <>
                                        <button
                                          className={styles.smallButton}
                                          onClick={() => {
                                            setEditingReplyId(rpl._id);
                                            setEditedReplyContent(rpl.content);
                                          }}
                                        >
                                          Edit
                                        </button>
                                        <button
                                          className={styles.deleteButton}
                                          onClick={() => handleDeleteReply(topic._id, cmt._id, rpl._id)}
                                        >
                                          Delete
                                        </button>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                              <small>{new Date(rpl.updatedAt).toLocaleString()}</small>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                  {/* If no comments at all: */}
                  {(!commentsByTopic[topic._id] ||
                    commentsByTopic[topic._id].length === 0) && (
                      <li style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>
                        No comments yet. Be the first to comment below!
                      </li>
                    )}
                </ul>

                {/** 3b) Add new comment form **/}
                <div className={styles.commentForm}>
                  <textarea
                    value={newCommentByTopic[topic._id] || ''}
                    onChange={(e) =>
                      setNewCommentByTopic((prev) => ({
                        ...prev,
                        [topic._id]: e.target.value
                      }))
                    }
                    placeholder="Write a comment..."
                    className={styles.profileInput}
                    rows={2}
                  />
                  {commentErrorByTopic[topic._id] && (
                    <div className={styles.profileError}>
                      {commentErrorByTopic[topic._id]}
                    </div>
                  )}
                  <button
                    onClick={() => handleCommentSubmit(topic._id)}
                    className={styles.profileSaveButton}
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminForumT1;

/**
 * A small helper component for editing a comment inline.
 * Props:
 *   initialContent: string
 *   onSave(newText) => void
 *   onDelete() => void
 */
const EditableComment = ({ initialContent, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(initialContent);

  return isEditing ? (
    <div>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={2}
        className={styles.profileInput}
      />
      <button
        onClick={() => {
          if (draft.trim()) {
            onSave(draft.trim());
            setIsEditing(false);
          }
        }}
        className={styles.profileSaveButton}
      >
        Save
      </button>
      <button
        onClick={() => {
          setIsEditing(false);
          setDraft(initialContent);
        }}
        className={styles.profileCancelButton}
      >
        Cancel
      </button>
      <button
        onClick={onDelete}
        className={styles.deleteButton}
        style={{ marginLeft: '0.5rem' }}
      >
        Delete
      </button>
    </div>
  ) : (
    <div>
      <span>{initialContent}</span>
      <button
        onClick={() => setIsEditing(true)}
        className={styles.smallButton}
        style={{ marginLeft: '0.5rem' }}
      >
        Edit
      </button>
    </div>
  );
};