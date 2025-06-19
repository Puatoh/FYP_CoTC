import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/auth/Register';
import AdminRegister from './components/auth/AdminRegister';
import ForgetPassword from './components/auth/ForgetPassword';
import Login from './components/auth/Login';
import StudentDashboard from './components/dashboard/StudentDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Tingkatan from './components/dashboard/Tingkatan';
import AdminTingkatan from './components/dashboard/AdminTingkatan';
import Tingkatan1 from './components/dashboard/Tingkatan1';
import AdminT1 from './components/dashboard/AdminT1';
import Bab1 from './components/dashboard/Bab1';
import AdminBab1 from './components/dashboard/AdminBab1';
import Forum from './components/dashboard/Forum';
import AdminForum from './components/dashboard/AdminForum';
import ForumT1Topics from './components/dashboard/ForumT1Topics';
import AdminForumT1 from './components/dashboard/AdminForumT1';
// import ForumT1Comments   from './components/dashboard/ForumT1Comments';
// import AdminForumT1Comments from './components/dashboard/AdminForumT1Comments';

import Latihan from './components/dashboard/Latihan';
import AdminLatihan from './components/dashboard/AdminLatihan';
import LatihanTingkatan1 from './components/dashboard/LatihanTingkatan1';
import AdminLatihanTingkatan1 from './components/dashboard/AdminLatihanTingkatan1';
import LatihanModuleTingkatan1 from './components/dashboard/LatihanModuleTingkatan1';
import AdminLatihanModuleTingkatan1 from './components/dashboard/AdminLatihanModuleTingkatan1';
import './firebase-config';

import { auth } from './firebase-config';

console.log("Current user:", auth.currentUser);


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/admin" element={<AdminRegister />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/admin" element={<Login isAdminMode={true} />} />
        <Route path="/forget-password" element={<ForgetPassword />} />      
        <Route path="/dashboard" element={ <ProtectedRoute> <StudentDashboard /> </ProtectedRoute> } />
        <Route path="/dashboard/admin" element={ <ProtectedRoute requiredRole="admin"> <AdminDashboard /> </ProtectedRoute> } />

        <Route path="/tingkatan" element={ <ProtectedRoute> <Tingkatan /> </ProtectedRoute> } />
        <Route path="/tingkatan/admin" element={ <ProtectedRoute requiredRole="admin"> <AdminTingkatan /> </ProtectedRoute> } />
        <Route path="/tingkatan-1" element={ <ProtectedRoute> <Tingkatan1 /> </ProtectedRoute> } />
        <Route path="/tingkatan-1/admin" element={ <ProtectedRoute requiredRole="admin"> <AdminT1 /> </ProtectedRoute> } />
        <Route path="/bab-1" element={ <ProtectedRoute> <Bab1 /> </ProtectedRoute> } />
        <Route path="/bab-1/admin" element={ <ProtectedRoute requiredRole="admin"> <AdminBab1 /> </ProtectedRoute> } />

        <Route path="/forum"element={<ProtectedRoute ><Forum /></ProtectedRoute>}/>
        <Route path="/forum/admin"element={<ProtectedRoute requiredRole="admin"><AdminForum /></ProtectedRoute>}/>
        <Route path="/forum-tingkatan-1"element={<ProtectedRoute><ForumT1Topics /></ProtectedRoute>}/>
        <Route path="/forum-tingkatan-1/admin"element={<ProtectedRoute requiredRole="admin"><AdminForumT1 /></ProtectedRoute>}/>
        {/* <Route path="/forum-tingkatan-1/:topicId/comments" element={<ProtectedRoute><ForumT1Comments  /></ProtectedRoute>}/>
        <Route path="/forum-tingkatan-1/:topicId/comments/admin"element={<ProtectedRoute requiredRole="admin"><AdminForumT1Comments /></ProtectedRoute>}/> */}
        <Route path="/latihan" element={ <ProtectedRoute> <Latihan /> </ProtectedRoute> } />
        <Route path="/latihan/admin" element={ <ProtectedRoute requiredRole="admin"> <AdminLatihan /> </ProtectedRoute> } />
        <Route path="/module-latihan-tingkatan-1"element={<ProtectedRoute><LatihanModuleTingkatan1 /></ProtectedRoute>}/>
        <Route path="/module-latihan-tingkatan-1/admin"element={<ProtectedRoute requiredRole="admin"><AdminLatihanModuleTingkatan1 /></ProtectedRoute>}/>
        <Route path="/module-latihan-tingkatan-1/:moduleId" element={ <ProtectedRoute> <LatihanTingkatan1/> </ProtectedRoute> } />
        <Route path="/module-latihan-tingkatan-1/:moduleId/admin" element={ <ProtectedRoute requiredRole="admin"> <AdminLatihanTingkatan1 /></ProtectedRoute> } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
