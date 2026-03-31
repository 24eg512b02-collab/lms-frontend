import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('lmsUser') || 'null')

  function handleLogout() {
    localStorage.removeItem('lmsToken')
    localStorage.removeItem('lmsUser')
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <span>🎓</span> LearnHub
      </div>
      <div className="navbar-right">
        {user ? (
          <>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
              👋 {user.name}
              <span className="chip" style={{ marginLeft: '0.5rem' }}>{user.role}</span>
            </span>
            <button className="btn btn-outline btn-sm"
              onClick={() => navigate(user.role === 'ADMIN' ? '/admin' : '/student')}>
              Dashboard
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={() => navigate('/auth')}>
            Login / Register
          </button>
        )}
      </div>
    </nav>
  )
}
