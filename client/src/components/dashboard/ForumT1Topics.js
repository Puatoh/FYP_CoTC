// src/components/dashboard/ForumT1Topics.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase-config';
import axios from 'axios';
import styles from './styles/StudentDashboard.module.css';

const ForumT1Topics = () => {
  const navigate = useNavigate();

  // ─────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [topicsError, setTopicsError] = useState('');

  const [commentsByTopic, setCommentsByTopic] = useState({});
  const [newCommentByTopic, setNewCommentByTopic] = useState({});
  const [commentErrorByTopic, setCommentErrorByTopic] = useState({});

  // Reply state keyed by commentId
  const [repliesByComment, setRepliesByComment] = useState({});
  const [newReplyByComment, setNewReplyByComment] = useState({});
  const [replyErrorByComment, setReplyErrorByComment] = useState({});
  const [showReplyForComment, setShowReplyForComment] = useState({});
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editedReplyContent, setEditedReplyContent] = useState('');

  const currentEmail = auth.currentUser?.email || '';

  // ─────────────────────────────────────────────────────────────────
  // FETCH ALL TOPICS
  // ─────────────────────────────────────────────────────────────────
  const fetchTopics = async () => {
    try {
      setLoadingTopics(true);
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get('/api/forum-tingkatan-1', {
        headers: { Authorization: `Bearer ${token}`, email: currentEmail }
      });
      setTopics(res.data);
    } catch (err) {
      console.error('Error fetching topics:', err);
      setTopicsError('Could not load topics. Please try again later.');
    } finally {
      setLoadingTopics(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // COMMENT CRUD (unchanged)
  // ─────────────────────────────────────────────────────────────────
  const fetchComments = async (topicId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get(
        `/api/forum-tingkatan-1/${topicId}/comments`,
        { headers: { Authorization: `Bearer ${token}`, email: currentEmail } }
      );
      setCommentsByTopic(prev => ({ ...prev, [topicId]: res.data }));
      return res.data;
    } catch {
      setCommentsByTopic(prev => ({ ...prev, [topicId]: [] }));
    }
  };

  const handleCommentSubmit = async (topicId) => {
    const content = (newCommentByTopic[topicId] || '').trim();
    if (!content) {
      setCommentErrorByTopic(prev => ({ ...prev, [topicId]: 'Comment cannot be empty.' }));
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(
        `/api/forum-tingkatan-1/${topicId}/comments`,
        { content, parentComment: null },
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, email: currentEmail } }
      );
      setNewCommentByTopic(prev => ({ ...prev, [topicId]: '' }));
      fetchComments(topicId);
    } catch (err) {
      setCommentErrorByTopic(prev => ({
        ...prev,
        [topicId]: err.response?.data?.message || 'Could not post comment. Try again.'
      }));
    }
  };

  const handleUpdateComment = async (topicId, commentId, newText) => {
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.put(
        `/api/forum-tingkatan-1/${topicId}/comments/${commentId}`,
        { content: newText },
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, email: currentEmail } }
      );
      fetchComments(topicId);
    } catch (err) { console.error(err) }
  };

  const handleDeleteComment = async (topicId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(
        `/api/forum-tingkatan-1/${topicId}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}`, email: currentEmail } }
      );
      fetchComments(topicId);
    } catch (err) { console.error(err) }
  };

  // ─────────────────────────────────────────────────────────────────
  // REPLY CRUD
  // ─────────────────────────────────────────────────────────────────
  const fetchReplies = async (topicId, commentId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get(
        `/api/forum-tingkatan-1/${topicId}/comments/${commentId}/replies`,
        { headers: { Authorization: `Bearer ${token}`, email: currentEmail } }
      );
      setRepliesByComment(prev => ({ ...prev, [commentId]: res.data }));
    } catch (err) {
      console.error(`Error fetching replies for ${commentId}:`, err);
    }
  };

  const handleReplySubmit = async (topicId, commentId) => {
    const content = (newReplyByComment[commentId] || '').trim();
    if (!content) {
      setReplyErrorByComment(prev => ({ ...prev, [commentId]: 'Reply cannot be empty.' }));
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
      await fetchReplies(topicId, commentId);
      setShowReplyForComment(prev => ({ ...prev, [commentId]: true }));
    } catch (err) {
      setReplyErrorByComment(prev => ({
        ...prev,
        [commentId]: err.response?.data?.message || 'Could not post reply.'
      }));
    }
  };

  const handleUpdateReply = async (topicId, commentId, replyId, newText) => {
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.put(
        `/api/forum-tingkatan-1/${topicId}/comments/${commentId}/replies/${replyId}`,
        { content: newText },
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, email: currentEmail } }
      );
      setEditingReplyId(null);
      fetchReplies(topicId, commentId);
    } catch (err) {
      console.error(err);
    }
  };

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
      console.error(err);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────────────
  const handleBack = () => navigate('/forum');

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.dashboardContainer}>
      <button className={styles.backButton} onClick={handleBack}>← Back</button>

      <div className={styles.mainContent}>
        <h1>Forum – Tingkatan 1</h1>

        {loadingTopics ? (
          <p>Loading topics…</p>
        ) : topicsError ? (
          <p style={{ color: 'red' }}>{topicsError}</p>
        ) : topics.length === 0 ? (
          <p style={{ fontStyle: 'italic', marginTop: '1rem' }}>
            No topics have been created yet.
          </p>
        ) : (
          topics.map(topic => (
            <div key={topic._id} className={styles.forumTopicCard}>
              <h2>{topic.title}</h2>
              <p>{topic.description}</p>
              <small style={{ color: '#666' }}>
                Created: {new Date(topic.createdAt).toLocaleString()} &nbsp;|&nbsp; Updated: {new Date(topic.updatedAt).toLocaleString()}
              </small>

              {/* Comments */}
              <div className={styles.commentSection} style={{ marginTop: '1.5rem' }}>
                <h3>Comments</h3>
                {!commentsByTopic[topic._id] ? (
                  <button
                    className={styles.smallButton}
                    onClick={async () => {
                      // 1) load comments, capturing the array
                      const cms = await fetchComments(topic._id);
                      // 2) immediately load each comment's replies
                      cms.forEach(cmt => fetchReplies(topic._id, cmt._id));
                    }}
                    style={{ marginBottom: '0.75rem' }}
                  >
                    Load Comments
                  </button>
                ) : (
                  <ul className={styles.commentList}>
                    {commentsByTopic[topic._id].map(cmt => (
                      <li key={cmt._id} className={styles.commentItem}>
                        <div>
                          <strong>{cmt.authorUsername}</strong> said:
                        </div>
                        <CommentBody
                          comment={cmt}
                          topicId={topic._id}
                          isAuthor={cmt.authorEmail === currentEmail}
                          onUpdate={newText => handleUpdateComment(topic._id, cmt._id, newText)}
                          onDelete={() => handleDeleteComment(topic._id, cmt._id)}
                        />

                        {/* Reply & Show Replies controls */}
                        <div className={styles.replyControls}>
                          {Array.isArray(repliesByComment[cmt._id]) && repliesByComment[cmt._id].length > 0 && (
                            <button
                              className={styles.replyButton}
                              onClick={() => {
                                setShowReplyForComment(prev => ({ ...prev, [cmt._id]: !prev[cmt._id] }));
                                if (!showReplyForComment[cmt._id]) {
                                  fetchReplies(topic._id, cmt._id);
                                }
                              }}
                            >
                              {showReplyForComment[cmt._id] ? 'Hide Replies' : 'Show Replies'}
                            </button>
                          )}
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

                        {/* Reply Form */}
                        {repliesByComment[`replyForm_${cmt._id}`] && (
                          <div className={styles.replyForm}>
                            <textarea
                              rows={2}
                              className={styles.profileInput}
                              placeholder="Write your reply..."
                              value={newReplyByComment[cmt._id] || ''}
                              onChange={e =>
                                setNewReplyByComment(prev => ({ ...prev, [cmt._id]: e.target.value }))
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

                        {/* Nested Replies */}
                        {showReplyForComment[cmt._id] && (
                          <ul className={styles.replyList}>
                            {(repliesByComment[cmt._id] || []).map((rpl, idx) => (
                              <li key={rpl._id} className={`${styles.replyItem} ${styles[`nestedLevel${(idx % 3)+1}`]}`}>
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
                                        onClick={() =>
                                          handleUpdateReply(topic._id, cmt._id, rpl._id, editedReplyContent)
                                        }
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
                    {commentsByTopic[topic._id].length === 0 && (
                      <li style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>
                        No comments yet. Be the first to comment below!
                      </li>
                    )}
                  </ul>
                )}

                {/* Add Comment Form */}
                <div className={styles.commentForm} style={{ marginTop: '1rem' }}>
                  <textarea
                    value={newCommentByTopic[topic._id] || ''}
                    onChange={e =>
                      setNewCommentByTopic(prev => ({ ...prev, [topic._id]: e.target.value }))
                    }
                    placeholder="Write a comment..."
                    className={styles.profileInput}
                    rows={3}
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

/**
 * Displays a single comment and edit/delete UI.
 */
const CommentBody = ({ comment, topicId, isAuthor, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);

  return isEditing ? (
    <div style={{ marginBottom: '0.5rem' }}>
      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        rows={2}
        className={styles.profileInput}
      />
      <button
        onClick={() => {
          const t = draft.trim();
          if (t) { onUpdate(t); setIsEditing(false); }
        }}
        className={styles.profileSaveButton}
        style={{ marginRight: '0.5rem' }}
      >
        Save
      </button>
      <button
        onClick={() => { setIsEditing(false); setDraft(comment.content); }}
        className={styles.profileCancelButton}
      >
        Cancel
      </button>
    </div>
  ) : (
    <div style={{ marginBottom: '0.5rem' }}>
      <p style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</p>
      {isAuthor && (
        <div>
          <button
            onClick={() => setIsEditing(true)}
            className={styles.smallButton}
            style={{ marginRight: '0.5rem' }}
          >
            Edit
          </button>
          <button onClick={onDelete} className={styles.deleteButton}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ForumT1Topics;
