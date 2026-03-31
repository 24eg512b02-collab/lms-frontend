import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { login, register } from '../api.js'

export default function AuthPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')       // 'login' | 'register'
  const [role, setRole] = useState('STUDENT')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await login({ email: form.email, password: form.password, role })
      const user = res.data
      // Validate role matches selection
      if (user.role !== role) {
        setError(`This account is registered as ${user.role}. Please select the correct role.`)
        setLoading(false)
        return
      }
      localStorage.setItem('lmsToken', user.token)
      localStorage.setItem('lmsUser', JSON.stringify(user))
      navigate(user.role === 'ADMIN' ? '/admin' : '/student')
    } catch (err) {
      setError(err.response?.data || 'Login failed. Check your credentials.')
    }
    setLoading(false)
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError('All fields are required.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      await register({ ...form, role })
      setSuccess('Account created successfully! Please login.')
      setTab('login')
      setForm({ name: '', email: '', phone: '', password: '' })
    } catch (err) {
      setError(err.response?.data || 'Registration failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div className="auth-wrapper">
        <div className="auth-card">
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>
            🎓 Welcome to LearnHub
          </h2>

          {/* Login / Register Tabs */}
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); setSuccess('') }}>
              Login
            </button>
            <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); setSuccess('') }}>
              Register
            </button>
          </div>

          {/* Role Selector */}
          <div className="role-selector">
            <div className={`role-option ${role === 'STUDENT' ? 'active' : ''}`} onClick={() => setRole('STUDENT')}>
              <div className="role-icon">🧑‍🎓</div>
              <div className="role-label">Student</div>
            </div>
            <div className={`role-option ${role === 'ADMIN' ? 'active' : ''}`} onClick={() => setRole('ADMIN')}>
              <div className="role-icon">👨‍🏫</div>
              <div className="role-label">Admin / Teacher</div>
            </div>
          </div>

          {error && <div className="error-msg">⚠️ {error}</div>}
          {success && <div className="success-msg">✅ {success}</div>}

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" placeholder="Enter your password"
                  value={form.password} onChange={handleChange} required />
              </div>
              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? 'Logging in...' : `Login as ${role === 'ADMIN' ? 'Admin' : 'Student'}`}
              </button>
              <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                Demo — Student: <b>student@lms.com / student123</b><br />
                Admin: <b>admin@lms.com / admin123</b>
              </p>
            </form>
          )}

          {/* REGISTER FORM */}
          {tab === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" placeholder="John Doe"
                  value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" placeholder="9876543210"
                  value={form.phone} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" placeholder="Minimum 6 characters"
                  value={form.password} onChange={handleChange} required />
              </div>
              <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--primary-dark)' }}>
                Registering as: <b>{role === 'ADMIN' ? '👨‍🏫 Admin / Teacher' : '🧑‍🎓 Student'}</b>
              </div>
              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? 'Registering...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
