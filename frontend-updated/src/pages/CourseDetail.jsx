import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { getCourseById, getLessonsByCourse, getQuizzesByCourse, checkEnrollment, enrollCourse } from '../api.js'

// Convert any YouTube URL to a proper embed URL
function toEmbedUrl(url) {
  if (!url) return ''
  if (url.includes('youtube.com/embed/')) return url
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/)
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`
  const watchMatch = url.match(/[?&]v=([^?&]+)/)
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`
  return url
}

export default function CourseDetail() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('lmsUser') || '{}')

  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeVideo, setActiveVideo] = useState(null)

  // Lesson progress: set of lesson IDs marked as completed
  const PROGRESS_KEY = `lesson_progress_${user.id}_${courseId}`
  const [completedLessons, setCompletedLessons] = useState(() => {
    try {
      const saved = localStorage.getItem(PROGRESS_KEY)
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch { return new Set() }
  })

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [courseRes, lessonRes, quizRes, enrollRes] = await Promise.all([
          getCourseById(courseId),
          getLessonsByCourse(courseId),
          getQuizzesByCourse(courseId),
          checkEnrollment(user.id, courseId)
        ])
        setCourse(courseRes.data)
        setLessons(lessonRes.data)
        setQuizzes(quizRes.data)
        setIsEnrolled(enrollRes.data)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    load()
  }, [courseId])

  async function handleEnroll() {
    try {
      await enrollCourse(user.id, courseId)
      setIsEnrolled(true)
    } catch {}
  }

  function toggleLessonComplete(lessonId) {
    setCompletedLessons(prev => {
      const next = new Set(prev)
      if (next.has(lessonId)) {
        next.delete(lessonId)
      } else {
        next.add(lessonId)
      }
      localStorage.setItem(PROGRESS_KEY, JSON.stringify([...next]))
      return next
    })
  }

  const progressPercent = lessons.length > 0
    ? Math.round((completedLessons.size / lessons.length) * 100)
    : 0

  if (loading) return (
    <div>
      <Navbar />
      <div className="loader"><div className="spinner"></div>Loading course...</div>
    </div>
  )

  if (!course) return (
    <div>
      <Navbar />
      <div className="empty-state"><p>Course not found.</p></div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div className="course-detail">

        {/* Course Header */}
        <div className="course-detail-header">
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.5rem' }}>
            <span onClick={() => navigate(user.role === 'ADMIN' ? '/admin' : '/student')}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}>Dashboard</span> / {course.title}
          </div>
          <h2>{course.title}</h2>
          <p>{course.description}</p>
          <div style={{ marginTop: '0.75rem', opacity: 0.85, fontSize: '0.9rem' }}>
            👨‍🏫 Instructor: <b>{course.instructorName || 'LearnHub Instructor'}</b>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {isEnrolled ? (
              <span className="badge badge-success" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                ✅ Enrolled
              </span>
            ) : (
              <button className="btn btn-white" onClick={handleEnroll} style={{ color: 'var(--primary)' }}>
                Enroll Now
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar (only for enrolled students with lessons) */}
        {isEnrolled && lessons.length > 0 && (
          <div className="dash-section" style={{ paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div className="dash-section-title" style={{ marginBottom: 0 }}>📈 Your Progress</div>
              <span style={{ fontWeight: 700, color: progressPercent === 100 ? 'var(--success)' : 'var(--primary)', fontSize: '0.95rem' }}>
                {completedLessons.size} / {lessons.length} Lessons Complete ({progressPercent}%)
              </span>
            </div>
            <div style={{
              height: 14, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <div style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: progressPercent === 100
                  ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                  : 'linear-gradient(90deg, var(--primary), var(--primary-dark, #4f46e5))',
                borderRadius: 99,
                transition: 'width 0.5s ease'
              }} />
            </div>
            {progressPercent === 100 && (
              <div style={{ marginTop: '0.6rem', color: '#16a34a', fontWeight: 600, fontSize: '0.9rem' }}>
                🎉 All lessons completed! Take the quiz below to finish the course.
              </div>
            )}
          </div>
        )}

        {/* Lessons */}
        <div className="dash-section">
          <div className="dash-section-title">🎥 Lessons ({lessons.length})</div>
          {lessons.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🎬</div><p>No lessons added yet.</p></div>
          ) : (
            <div className="lesson-list">
              {lessons.map((lesson, i) => {
                const isDone = completedLessons.has(lesson.id)
                const embedUrl = toEmbedUrl(lesson.videoUrl)
                return (
                  <div className="lesson-item" key={lesson.id} style={{
                    borderLeft: isDone ? '4px solid #22c55e' : '4px solid transparent',
                    transition: 'border-color 0.2s'
                  }}>
                    <div className="lesson-num" style={{ background: isDone ? '#22c55e' : undefined }}>
                      {isDone ? '✓' : i + 1}
                    </div>
                    <div className="lesson-info" style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <div className="lesson-title" style={{ textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.65 : 1 }}>
                          {lesson.title}
                        </div>
                        {isEnrolled && (
                          <button
                            onClick={() => toggleLessonComplete(lesson.id)}
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.6rem',
                              borderRadius: 99,
                              border: isDone ? '1.5px solid #22c55e' : '1.5px solid #d1d5db',
                              background: isDone ? '#f0fff4' : 'white',
                              color: isDone ? '#16a34a' : '#6b7280',
                              cursor: 'pointer',
                              fontWeight: 600,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {isDone ? '✅ Done' : 'Mark as Done'}
                          </button>
                        )}
                      </div>
                      {lesson.content && <div className="lesson-desc">{lesson.content}</div>}
                      {embedUrl && (
                        <div style={{ marginTop: '0.5rem' }}>
                          {activeVideo === lesson.id ? (
                            <div className="video-embed">
                              <iframe
                                src={embedUrl}
                                title={lesson.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          ) : (
                            <button className="btn btn-outline btn-sm" onClick={() => setActiveVideo(lesson.id)}>
                              ▶ Watch Video
                            </button>
                          )}
                          {activeVideo === lesson.id && (
                            <button className="btn btn-outline btn-sm" style={{ marginTop: '0.4rem' }}
                              onClick={() => setActiveVideo(null)}>
                              ✕ Close Video
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quizzes */}
        {isEnrolled && quizzes.length > 0 && (
          <div className="dash-section">
            <div className="dash-section-title">📝 Course Quiz</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {quizzes.map(quiz => (
                <div key={quiz.id} style={{ background: 'white', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{quiz.title}</div>
                    <div style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      {quiz.questions ? quiz.questions.length : 0} questions
                    </div>
                  </div>
                  <button className="btn btn-primary"
                    onClick={() => navigate(`/quiz/${quiz.id}/${courseId}`)}>
                    Attempt Quiz →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isEnrolled && (
          <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius)', padding: '1.5rem', textAlign: 'center', marginTop: '1rem' }}>
            <p style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>
              🔒 Enroll in this course to access the quiz and track your progress.
            </p>
            <button className="btn btn-primary" style={{ marginTop: '0.75rem' }} onClick={handleEnroll}>
              Enroll Now
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
