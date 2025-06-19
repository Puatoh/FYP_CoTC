// // src/components/dashboard/ForumT1Comments.js
// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { auth } from '../../firebase-config';
// import axios from 'axios';
// import styles from './styles/StudentDashboard.module.css';

// /**
//  * Recursive component to render a comment + its nested replies.
//  * Props:
//  *   - commentTree: {
//  *       _id,
//  *       authorUsername,
//  *       content,
//  *       createdAt,
//  *       updatedAt,
//  *       parentComment,
//  *       children: [ … ]
//  *     }
//  *   - currentUsername: string
//  *   - topicId: string
//  *   - onReply(topicId, parentCommentId, replyContent)
//  *   - onUpdate(topicId, commentId, newContent)
//  *   - onDelete(topicId, commentId)
//  */
// const CommentNode = ({
//   commentTree,
//   currentUsername,
//   topicId,
//   onReply,
//   onUpdate,
//   onDelete
// }) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [editDraft, setEditDraft] = useState(commentTree.content);
//   const [showReplyForm, setShowReplyForm] = useState(false);
//   const [replyText, setReplyText] = useState('');

//   const handleSaveEdit = () => {
//     const trimmed = editDraft.trim();
//     if (trimmed) {
//       onUpdate(topicId, commentTree._id, trimmed);
//       setIsEditing(false);
//     }
//   };

//   const handleSubmitReply = () => {
//     const trimmed = replyText.trim();
//     if (trimmed) {
//       onReply(topicId, commentTree._id, trimmed);
//       setReplyText('');
//       setShowReplyForm(false);
//     }
//   };

//   return (
//     <div
//       style={{
//         marginLeft: commentTree.parentComment ? '1.5rem' : '0',
//         marginTop: '1rem'
//       }}
//     >
//       <div
//         style={{
//           borderLeft: commentTree.parentComment ? '2px solid #ccc' : 'none',
//           paddingLeft: '0.5rem'
//         }}
//       >
//         <div>
//           <strong>{commentTree.authorUsername}</strong> &nbsp;
//           <small style={{ color: '#666' }}>
//             {new Date(commentTree.updatedAt).toLocaleString()}
//           </small>
//         </div>

//         {isEditing ? (
//           <>
//             <textarea
//               value={editDraft}
//               onChange={(e) => setEditDraft(e.target.value)}
//               rows={2}
//               className={styles.profileInput}
//             />
//             <button
//               onClick={handleSaveEdit}
//               className={styles.profileSaveButton}
//               style={{ marginRight: '0.5rem', marginTop: '0.3rem' }}
//             >
//               Save
//             </button>
//             <button
//               onClick={() => {
//                 setIsEditing(false);
//                 setEditDraft(commentTree.content);
//               }}
//               className={styles.profileCancelButton}
//               style={{ marginTop: '0.3rem' }}
//             >
//               Cancel
//             </button>
//           </>
//         ) : (
//           <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.3rem' }}>
//             {commentTree.content}
//           </p>
//         )}

//         <div style={{ marginTop: '0.5rem' }}>
//           {/* Reply button (any logged‐in user) */}
//           <button
//             onClick={() => setShowReplyForm((prev) => !prev)}
//             className={styles.smallButton}
//           >
//             Reply
//           </button>
//           {/* Edit/Delete only if this comment’s author is the current user */}
//           {commentTree.authorUsername === currentUsername && !isEditing && (
//             <>
//               <button
//                 onClick={() => setIsEditing(true)}
//                 className={styles.smallButton}
//                 style={{ marginLeft: '0.5rem' }}
//               >
//                 Edit
//               </button>
//               <button
//                 onClick={() => onDelete(topicId, commentTree._id)}
//                 className={styles.deleteButton}
//                 style={{ marginLeft: '0.5rem' }}
//               >
//                 Delete
//               </button>
//             </>
//           )}
//         </div>

//         {/* Reply form, if toggled */}
//         {showReplyForm && (
//           <div style={{ marginTop: '0.5rem' }}>
//             <textarea
//               value={replyText}
//               onChange={(e) => setReplyText(e.target.value)}
//               rows={2}
//               className={styles.profileInput}
//               placeholder="Write a reply…"
//             />
//             <button
//               onClick={handleSubmitReply}
//               className={styles.profileSaveButton}
//               style={{ marginRight: '0.5rem', marginTop: '0.3rem' }}
//             >
//               Post Reply
//             </button>
//             <button
//               onClick={() => setShowReplyForm(false)}
//               className={styles.profileCancelButton}
//               style={{ marginTop: '0.3rem' }}
//             >
//               Cancel
//             </button>
//           </div>
//         )}

//         {/* Recursively render any child replies */}
//         {commentTree.children &&
//           commentTree.children.map((child) => (
//             <CommentNode
//               key={child._id}
//               commentTree={child}
//               currentUsername={currentUsername}
//               topicId={topicId}
//               onReply={onReply}
//               onUpdate={onUpdate}
//               onDelete={onDelete}
//             />
//           ))}
//       </div>
//     </div>
//   );
// };

// const ForumT1Comments = () => {
//   const navigate = useNavigate();
//   const { topicId } = useParams(); // route: /forum-tingkatan-1/:topicId/comments

//   // ─────────────────────────────────────────────────────────────────
//   // STATE
//   // ─────────────────────────────────────────────────────────────────
//   const [topic, setTopic] = useState(null);
//   const [loadingTopic, setLoadingTopic] = useState(true);
//   const [topicsLoadingError, setTopicsLoadingError] = useState('');

//   // Nested comment tree
//   const [commentTree, setCommentTree] = useState([]);
//   const [loadingComments, setLoadingComments] = useState(true);

//   // New root‐level comment (for this topic)
//   const [newRootComment, setNewRootComment] = useState('');
//   const [rootCommentError, setRootCommentError] = useState('');

//   // Current user’s username:
//   const currentUsername =
//     auth.currentUser?.displayName ||
//     auth.currentUser?.email.split('@')[0] ||
//     'Unknown';

//   // ─────────────────────────────────────────────────────────────────
//   // FETCH TOPIC DETAILS (on mount)
//   // ─────────────────────────────────────────────────────────────────
//   const fetchTopic = async () => {
//     try {
//       setLoadingTopic(true);
//       const res = await axios.get(`/api/forum-tingkatan-1/${topicId}`, {
//         headers: { email: auth.currentUser.email }
//       });
//       setTopic(res.data);
//     } catch (err) {
//       console.error('Error fetching topic:', err);
//       setTopicsLoadingError('Failed to load topic.');
//     } finally {
//       setLoadingTopic(false);
//     }
//   };

//   // ─────────────────────────────────────────────────────────────────
//   // FETCH COMMENTS (nested)
//   // ─────────────────────────────────────────────────────────────────
//   const fetchComments = async () => {
//     try {
//       setLoadingComments(true);
//       const res = await axios.get(
//         `/api/forum-tingkatan-1/${topicId}/comments`,
//         {
//           headers: { email: auth.currentUser.email }
//         }
//       );
//       // Server returns a nested comment tree
//       setCommentTree(res.data);
//     } catch (err) {
//       console.error('Error fetching comments:', err);
//     } finally {
//       setLoadingComments(false);
//     }
//   };

//   useEffect(() => {
//     fetchTopic();
//     fetchComments();
//     // eslint-disable-next-line
//   }, [topicId]);

//   // ─────────────────────────────────────────────────────────────────
//   // BACK button → go back to “forum main” (student view)
//   // ─────────────────────────────────────────────────────────────────
//   const handleBack = () => {
//     navigate('/forum-tingkatan-1');
//   };

//   // ─────────────────────────────────────────────────────────────────
//   // POST a new ROOT-LEVEL comment
//   // ─────────────────────────────────────────────────────────────────
//   const handleNewRootComment = async () => {
//     setRootCommentError('');
//     const trimmed = newRootComment.trim();
//     if (!trimmed) {
//       setRootCommentError('Comment cannot be empty.');
//       return;
//     }
//     try {
//       await axios.post(
//         `/api/forum-tingkatan-1/${topicId}/comments`,
//         { content: trimmed, parentComment: null },
//         { headers: { email: auth.currentUser.email } }
//       );
//       setNewRootComment('');
//       fetchComments();
//     } catch (err) {
//       console.error('Error posting root comment:', err);
//       setRootCommentError(
//         err.response?.data?.message || 'Could not post comment.'
//       );
//     }
//   };

//   // ─────────────────────────────────────────────────────────────────
//   // Reply to a specific comment (any user)
//   // ─────────────────────────────────────────────────────────────────
//   const handleReply = async (topicId, parentCommentId, replyContent) => {
//     try {
//       await axios.post(
//         `/api/forum-tingkatan-1/${topicId}/comments`,
//         { content: replyContent, parentComment: parentCommentId },
//         { headers: { email: auth.currentUser.email } }
//       );
//       fetchComments();
//     } catch (err) {
//       console.error(`Error posting reply to ${parentCommentId}:`, err);
//     }
//   };

//   // ─────────────────────────────────────────────────────────────────
//   // Update a comment (only by its author)
//   // ─────────────────────────────────────────────────────────────────
//   const handleUpdateComment = async (topicId, commentId, newContent) => {
//     try {
//       await axios.put(
//         `/api/forum-tingkatan-1/${topicId}/comments/${commentId}`,
//         { content: newContent },
//         { headers: { email: auth.currentUser.email } }
//       );
//       fetchComments();
//     } catch (err) {
//       console.error(`Error updating comment ${commentId}:`, err);
//     }
//   };

//   // ─────────────────────────────────────────────────────────────────
//   // Delete a comment (only by its author)
//   // ─────────────────────────────────────────────────────────────────
//   const handleDeleteComment = async (topicId, commentId) => {
//     if (!window.confirm('Delete this comment and its replies?')) return;
//     try {
//       await axios.delete(
//         `/api/forum-tingkatan-1/${topicId}/comments/${commentId}`,
//         { headers: { email: auth.currentUser.email } }
//       );
//       fetchComments();
//     } catch (err) {
//       console.error(`Error deleting comment ${commentId}:`, err);
//     }
//   };

//   // ─────────────────────────────────────────────────────────────────
//   // RENDER
//   // ─────────────────────────────────────────────────────────────────
//   return (
//     <div className={styles.dashboardContainer}>
//       {/* Back button */}
//       <button className={styles.backButton} onClick={handleBack}>
//         ← Back
//       </button>

//       <div className={styles.mainContent}>
//         {loadingTopic ? (
//           <p>Loading topic…</p>
//         ) : topicsLoadingError ? (
//           <p style={{ color: 'red' }}>{topicsLoadingError}</p>
//         ) : (
//           <>
//             <h1>{topic?.title}</h1>
//             <p>{topic?.description}</p>
//             <small style={{ fontStyle: 'italic' }}>
//               Created: {new Date(topic.createdAt).toLocaleString()}
//               &nbsp;|&nbsp;
//               Updated: {new Date(topic.updatedAt).toLocaleString()}
//             </small>
//           </>
//         )}

//         <hr style={{ margin: '1rem 0' }} />

//         {/* SECTION: New root comment */}
//         <section style={{ marginBottom: '2rem' }}>
//           <h2>Post a Comment</h2>
//           <textarea
//             value={newRootComment}
//             onChange={(e) => setNewRootComment(e.target.value)}
//             rows={3}
//             className={styles.profileInput}
//             placeholder="Write your comment here…"
//           />
//           {rootCommentError && (
//             <div className={styles.profileError}>{rootCommentError}</div>
//           )}
//           <button
//             onClick={handleNewRootComment}
//             className={styles.profileSaveButton}
//             style={{ marginTop: '0.5rem' }}
//           >
//             Post Comment
//           </button>
//         </section>

//         <hr />

//         {/* SECTION: Nested comment tree */}
//         <section>
//           <h2>All Comments</h2>
//           {loadingComments ? (
//             <p>Loading comments…</p>
//           ) : commentTree.length === 0 ? (
//             <p style={{ fontStyle: 'italic' }}>
//               No comments yet. Be the first to comment above!
//             </p>
//           ) : (
//             commentTree.map((root) => (
//               <CommentNode
//                 key={root._id}
//                 commentTree={root}
//                 currentUsername={currentUsername}
//                 topicId={topicId}
//                 onReply={handleReply}
//                 onUpdate={handleUpdateComment}
//                 onDelete={handleDeleteComment}
//               />
//             ))
//           )}
//         </section>
//       </div>
//     </div>
//   );
// };

// export default ForumT1Comments;
