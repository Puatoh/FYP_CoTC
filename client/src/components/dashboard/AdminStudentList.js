// // src/components/dashboard/AdminStudentList.js
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { auth } from '../../firebase-config';
// import styles from './styles/StudentDashboard.module.css';

// const AdminStudentList = () => {
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchStudents = async () => {
//       try {
//         const currentUser = auth.currentUser;
//         if (!currentUser) return;

//         const token = await currentUser.getIdToken();
//         const res = await axios.get('/api/students', {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             email: currentUser.email,
//           },
//         });

//         setStudents(res.data || []);
//       } catch (err) {
//         console.error('Error fetching student list:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStudents();
//   }, []);

//   return (
//     <div className={styles.mainContent}>
//       <h2>Registered Students</h2>
//       {loading ? (
//         <p>Loading student data…</p>
//       ) : (
//         <table className={styles.studentTable}>
//           <thead>
//             <tr>
//               <th>Name</th>
//               <th>Email</th>
//               <th>Exercise Completion</th>
//             </tr>
//           </thead>
//           <tbody>
//             {students.length === 0 ? (
//               <tr>
//                 <td colSpan="3">No students found.</td>
//               </tr>
//             ) : (
//               students.map((s, idx) => (
//                 <tr key={idx}>
//                   <td>{s.username}</td>
//                   <td>{s.email}</td>
//                   <td>{s.exerciseSummary || '—'}</td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default AdminStudentList;
