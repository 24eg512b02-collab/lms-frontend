import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import CourseDetail from './pages/CourseDetail.jsx'
import QuizPage from './pages/QuizPage.jsx'

function PrivateRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem('lmsUser') || 'null')
  if (!user) return <Navigate to="/auth" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/student" element={
          <PrivateRoute role="STUDENT"><StudentDashboard /></PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute role="ADMIN"><AdminDashboard /></PrivateRoute>
        } />
        <Route path="/course/:courseId" element={
          <PrivateRoute><CourseDetail /></PrivateRoute>
        } />
        <Route path="/quiz/:quizId/:courseId" element={
          <PrivateRoute><QuizPage /></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
