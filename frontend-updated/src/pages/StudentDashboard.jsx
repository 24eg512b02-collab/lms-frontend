import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { getAllCourses, getUserEnrollments, enrollCourse, checkEnrollment } from '../api.js'

const COURSE_ICONS = ['📚', '💻', '🔬', '🎨', '📐', '🌐', '⚙️', '🧠']

export default function StudentDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('lmsUser') || '{}')
  const [tab, setTab] = useState('available')
  const [allCourses, setAllCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [enrolledIds, setEnrolledIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [coursesRes, enrollRes] = await Promise.all([
        getAllCourses(),
        getUserEnrollments(user.id)
      ])
      setAllCourses(coursesRes.data)
      setEnrollments(enrollRes.data)
      const ids = new Set(enrollRes.data.map(e => e.course.id))
      setEnrolledIds(ids)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  async function handleEnroll(courseId) {
    setEnrolling(courseId)
    setMsg('')
    try {
      await enrollCourse(user.id, courseId)
      setMsg('Successfully enrolled!')
      await fetchData()
    } catch (err) {
      setMsg(err.response?.data || 'Already enrolled or error occurred.')
    }
    setEnrolling(null)
  }

  const enrolled = enrollments.filter(e => !e.completed)
  const completed = enrollments.filter(e => e.completed)

  const availableCourses = allCourses.filter(c => !enrolledIds.has(c.id))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div className="dashboard">

        {/* Header */}
        <div className="dash-header">
          <h2>Welcome back, {user.name}! 👋</h2>
          <p>Keep learning and growing every day</p>
          <div className="dash-stats">
            <div className="stat-box">
              <div className="num">{allCourses.length}</div>
              <div className="label">Available</div>
            </div>
            <div className="stat-box">
              <div className="num">{enrolled.length}</div>
              <div className="label">In Progress</div>
            </div>
            <div className="stat-box">
              <div className="num">{completed.length}</div>
              <div className="label">Completed</div>
            </div>
          </div>
        </div>

        <div className="dash-content">
          {msg && <div className="success-msg" style={{ marginBottom: '1rem' }}>✅ {msg}</div>}

          {/* Tabs */}
          <div className="tabs">
            <button className={`tab-btn ${tab === 'available' ? 'active' : ''}`} onClick={() => setTab('available')}>
              🌐 Available Courses ({availableCourses.length})
            </button>
            <button className={`tab-btn ${tab === 'enrolled' ? 'active' : ''}`} onClick={() => setTab('enrolled')}>
              📖 My Courses ({enrolled.length})
            </button>
            <button className={`tab-btn ${tab === 'completed' ? 'active' : ''}`} onClick={() => setTab('completed')}>
              🏆 Completed ({completed.length})
            </button>
          </div>

          {loading ? (
            <div className="loader"><div className="spinner"></div>Loading courses...</div>
          ) : (
            <>
              {/* AVAILABLE COURSES */}
              {tab === 'available' && (
                <div>
                  {availableCourses.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">🎉</div>
                      <p>You've enrolled in all available courses!</p>
                    </div>
                  ) : (
                    <div className="courses-grid">
                      {availableCourses.map((course, i) => (
                        <div className="course-card" key={course.id}>
                          <div className="course-card-img">{COURSE_ICONS[i % COURSE_ICONS.length]}</div>
                          <div className="course-card-body">
                            <div className="course-card-title">{course.title}</div>
                            <div className="course-card-desc">{course.description}</div>
                            <div className="course-card-instructor">
                              👨‍🏫 {course.instructorName || 'LearnHub Instructor'}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn btn-outline btn-sm"
                                onClick={() => navigate(`/course/${course.id}`)}>
                                Preview
                              </button>
                              <button className="btn btn-primary btn-sm"
                                disabled={enrolling === course.id}
                                onClick={() => handleEnroll(course.id)}>
                                {enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* MY ENROLLED COURSES */}
              {tab === 'enrolled' && (
                <div>
                  {enrolled.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📚</div>
                      <p>You haven't enrolled in any courses yet.</p>
                      <button className="btn btn-primary" style={{ marginTop: '1rem' }}
                        onClick={() => setTab('available')}>Browse Courses</button>
                    </div>
                  ) : (
                    <div className="courses-grid">
                      {enrolled.map((enr, i) => (
                        <div className="course-card" key={enr.id}>
                          <div className="course-card-img">{COURSE_ICONS[i % COURSE_ICONS.length]}</div>
                          <div className="course-card-body">
                            <div className="course-card-title">{enr.course.title}</div>
                            <div className="course-card-desc">{enr.course.description}</div>
                            <div className="course-card-instructor">
                              👨‍🏫 {enr.course.instructorName || 'LearnHub Instructor'}
                            </div>
                            <span className="badge badge-warning" style={{ marginBottom: '0.75rem' }}>In Progress</span>
                            <br />
                            <button className="btn btn-primary btn-sm"
                              onClick={() => navigate(`/course/${enr.course.id}`)}>
                              Continue Learning →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* COMPLETED COURSES */}
              {tab === 'completed' && (
                <div>
                  {completed.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">🏆</div>
                      <p>No completed courses yet. Keep going!</p>
                    </div>
                  ) : (
                    <div className="courses-grid">
                      {completed.map((enr, i) => (
                        <div className="course-card" key={enr.id}>
                          <div className="course-card-img">{COURSE_ICONS[i % COURSE_ICONS.length]}</div>
                          <div className="course-card-body">
                            <div className="course-card-title">{enr.course.title}</div>
                            <div className="course-card-desc">{enr.course.description}</div>
                            <div className="course-card-instructor">
                              👨‍🏫 {enr.course.instructorName || 'LearnHub Instructor'}
                            </div>
                            <span className="badge badge-success" style={{ marginBottom: '0.75rem', display: 'block', width: 'fit-content' }}>✅ Completed</span>

                            {/* Quiz Score */}
                            {enr.quizScore !== null && enr.quizScore !== undefined && enr.totalQuestions && (
                              <div style={{ marginBottom: '0.75rem' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '0.3rem' }}>
                                  Quiz Score: {enr.quizScore}/{enr.totalQuestions} ({Math.round(enr.quizScore * 100 / enr.totalQuestions)}%)
                                </div>
                                <div className="progress-bar-wrap" style={{ height: 10 }}>
                                  <div className="progress-bar-fill correct-bar"
                                    style={{ width: `${Math.round(enr.quizScore * 100 / enr.totalQuestions)}%` }}>
                                  </div>
                                </div>
                              </div>
                            )}
                            <button className="btn btn-outline btn-sm"
                              onClick={() => navigate(`/course/${enr.course.id}`)}>
                              Review Course
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
