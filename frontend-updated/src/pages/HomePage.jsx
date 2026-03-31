import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const features = [
  { icon: '📚', title: 'Rich Course Library', desc: 'Access hundreds of courses across tech, business, and design.' },
  { icon: '🎥', title: 'Video Lessons', desc: 'Learn at your own pace with HD video content uploaded by expert instructors.' },
  { icon: '📝', title: 'Interactive Quizzes', desc: 'Test your knowledge with quizzes and get instant feedback on your progress.' },
  { icon: '📊', title: 'Progress Tracking', desc: 'Visual progress bars show exactly how far you\'ve come in every course.' },
]

const stats = [
  { num: '500+', label: 'Courses' },
  { num: '20K+', label: 'Students' },
  { num: '100+', label: 'Instructors' },
  { num: '95%', label: 'Satisfaction' },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <h1>Learn Without Limits</h1>
        <p>Join thousands of students mastering new skills with expert-led courses, videos, and quizzes — all in one place.</p>
        <div className="hero-btns">
          <button className="btn btn-white btn-lg" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}
            onClick={() => navigate('/auth')}>
            🚀 Get Started Free
          </button>
          <button className="btn btn-ghost btn-lg" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}
            onClick={() => navigate('/auth')}>
            Browse Courses
          </button>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: 'white', padding: '2rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', maxWidth: '800px', margin: '0 auto' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{s.num}</div>
              <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <h2 className="section-title">Why Choose LearnHub?</h2>
        <p className="section-sub">Everything you need to grow your skills in one platform</p>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: 'white', padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 className="section-title">How It Works</h2>
        <p className="section-sub">Three simple steps to start learning today</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', maxWidth: '800px', margin: '0 auto' }}>
          {[
            { step: '1', icon: '📝', title: 'Register', desc: 'Create a free account as a student or admin.' },
            { step: '2', icon: '🔍', title: 'Enroll', desc: 'Browse and enroll in courses that interest you.' },
            { step: '3', icon: '🏆', title: 'Learn & Grow', desc: 'Watch videos, take quizzes, track your progress.' },
          ].map((s, i) => (
            <div key={i} style={{ flex: '1 1 200px', maxWidth: '220px' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary)', color: 'white', fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 800 }}>
                {s.step}
              </div>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>{s.title}</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{s.desc}</p>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" style={{ marginTop: '2.5rem', padding: '0.8rem 2.5rem', fontSize: '1rem' }}
          onClick={() => navigate('/auth')}>
          Start Learning Today →
        </button>
      </section>

      <Footer />
    </div>
  )
}
