import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import {
  getCoursesByInstructor, addCourse, deleteCourse,
  getLessonsByCourse, addLesson, deleteLesson,
  getQuizzesByCourse, createQuiz, deleteQuiz, addQuestionsToQuiz,
  getAllCourses
} from '../api.js'

// Helper to convert any YouTube URL to embed URL
function toEmbedUrl(url) {
  if (!url) return ''
  if (url.includes('youtube.com/embed/')) return url
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/)
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`
  const watchMatch = url.match(/[?&]v=([^?&]+)/)
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`
  return url
}

const BLANK_OPTION = () => ({ text: '', correct: false })
const BLANK_QUESTION = () => ({ text: '', options: [BLANK_OPTION(), BLANK_OPTION(), BLANK_OPTION(), BLANK_OPTION()] })

export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem('lmsUser') || '{}')
  const [tab, setTab] = useState('courses')

  // Courses
  const [courses, setCourses] = useState([])
  const [courseForm, setCourseForm] = useState({ title: '', description: '' })
  const [courseMsg, setCourseMsg] = useState('')

  // Lessons
  const [selectedCourse, setSelectedCourse] = useState('')
  const [lessons, setLessons] = useState([])
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', videoUrl: '' })
  const [lessonMsg, setLessonMsg] = useState('')

  // Quizzes
  const [quizCourse, setQuizCourse] = useState('')
  const [quizzes, setQuizzes] = useState([])
  const [quizForm, setQuizForm] = useState({ title: '' })
  const [quizMsg, setQuizMsg] = useState('')

  // Quiz questions builder
  const [quizStep, setQuizStep] = useState('title') // 'title' | 'questions'
  const [createdQuizId, setCreatedQuizId] = useState(null)
  const [createdQuizTitle, setCreatedQuizTitle] = useState('')
  const [questions, setQuestions] = useState([BLANK_QUESTION()])
  const [savingQuestions, setSavingQuestions] = useState(false)

  useEffect(() => { fetchCourses() }, [])
  useEffect(() => { if (selectedCourse) fetchLessons(selectedCourse) }, [selectedCourse])
  useEffect(() => { if (quizCourse) fetchQuizzes(quizCourse) }, [quizCourse])

  async function fetchCourses() {
    try { const res = await getCoursesByInstructor(user.id); setCourses(res.data) }
    catch { setCourses([]) }
  }

  async function fetchLessons(courseId) {
    try { const res = await getLessonsByCourse(courseId); setLessons(res.data) }
    catch { setLessons([]) }
  }

  async function fetchQuizzes(courseId) {
    try { const res = await getQuizzesByCourse(courseId); setQuizzes(res.data) }
    catch { setQuizzes([]) }
  }

  // --- COURSE HANDLERS ---
  async function handleAddCourse(e) {
    e.preventDefault()
    setCourseMsg('')
    if (!courseForm.title) return
    try {
      await addCourse(courseForm, user.id)
      setCourseMsg('Course added successfully!')
      setCourseForm({ title: '', description: '' })
      fetchCourses()
    } catch { setCourseMsg('Error adding course.') }
  }

  async function handleDeleteCourse(id) {
    if (!window.confirm('Delete this course? All its lessons and quizzes will also be removed.')) return
    try { await deleteCourse(id); fetchCourses() } catch {}
  }

  // --- LESSON HANDLERS ---
  async function handleAddLesson(e) {
    e.preventDefault()
    setLessonMsg('')
    if (!lessonForm.title || !selectedCourse) return
    try {
      const embedUrl = toEmbedUrl(lessonForm.videoUrl)
      await addLesson({ ...lessonForm, videoUrl: embedUrl, course: { id: Number(selectedCourse) } })
      setLessonMsg('Lesson added successfully!')
      setLessonForm({ title: '', content: '', videoUrl: '' })
      fetchLessons(selectedCourse)
    } catch { setLessonMsg('Error adding lesson.') }
  }

  async function handleDeleteLesson(id) {
    try { await deleteLesson(id); fetchLessons(selectedCourse) } catch {}
  }

  // --- QUIZ HANDLERS ---
  function resetQuizBuilder() {
    setQuizStep('title')
    setCreatedQuizId(null)
    setCreatedQuizTitle('')
    setQuizForm({ title: '' })
    setQuestions([BLANK_QUESTION()])
    setQuizMsg('')
  }

  async function handleCreateQuizTitle(e) {
    e.preventDefault()
    setQuizMsg('')
    if (!quizForm.title || !quizCourse) return
    try {
      const res = await createQuiz({ title: quizForm.title, course: { id: Number(quizCourse) } })
      setCreatedQuizId(res.data.id)
      setCreatedQuizTitle(res.data.title)
      setQuizStep('questions')
    } catch { setQuizMsg('Error creating quiz. Please try again.') }
  }

  async function handleDeleteQuiz(id) {
    try { await deleteQuiz(id); fetchQuizzes(quizCourse) } catch {}
  }

  // --- Question/Option Helpers ---
  function updateQuestion(qi, field, value) {
    setQuestions(prev => prev.map((q, i) => i === qi ? { ...q, [field]: value } : q))
  }

  function updateOption(qi, oi, field, value) {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qi) return q
      const opts = q.options.map((o, j) => {
        if (field === 'correct') return { ...o, correct: j === oi }
        return j === oi ? { ...o, [field]: value } : o
      })
      return { ...q, options: opts }
    }))
  }

  function addQuestion() {
    setQuestions(prev => [...prev, BLANK_QUESTION()])
  }

  function removeQuestion(qi) {
    setQuestions(prev => prev.filter((_, i) => i !== qi))
  }

  async function handleSaveQuestions() {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.text.trim()) { alert(`Question ${i + 1} text is empty.`); return }
      if (!q.options.some(o => o.correct)) { alert(`Question ${i + 1} has no correct answer marked.`); return }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) { alert(`Option ${j + 1} in Question ${i + 1} is empty.`); return }
      }
    }
    setSavingQuestions(true)
    try {
      await addQuestionsToQuiz(createdQuizId, questions)
      setQuizMsg(`✅ Quiz "${createdQuizTitle}" with ${questions.length} question(s) created successfully!`)
      fetchQuizzes(quizCourse)
      resetQuizBuilder()
    } catch {
      setQuizMsg('Error saving questions. Please try again.')
    }
    setSavingQuestions(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div className="dashboard">

        <div className="dash-header">
          <h2>Admin Dashboard 👨‍🏫</h2>
          <p>Manage your courses, lessons and quizzes</p>
          <div className="dash-stats">
            <div className="stat-box">
              <div className="num">{courses.length}</div>
              <div className="label">My Courses</div>
            </div>
          </div>
        </div>

        <div className="dash-content">
          <div className="tabs">
            <button className={`tab-btn ${tab === 'courses' ? 'active' : ''}`} onClick={() => setTab('courses')}>📚 Courses</button>
            <button className={`tab-btn ${tab === 'lessons' ? 'active' : ''}`} onClick={() => setTab('lessons')}>🎥 Lessons</button>
            <button className={`tab-btn ${tab === 'quizzes' ? 'active' : ''}`} onClick={() => { setTab('quizzes'); resetQuizBuilder() }}>📝 Quizzes</button>
          </div>

          {/* ---- COURSES TAB ---- */}
          {tab === 'courses' && (
            <div>
              <div className="admin-form">
                <h3>➕ Add New Course</h3>
                {courseMsg && <div className="success-msg">{courseMsg}</div>}
                <form onSubmit={handleAddCourse}>
                  <div className="form-group">
                    <label>Course Title</label>
                    <input value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                      placeholder="e.g. Advanced JavaScript" required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                      placeholder="What will students learn in this course?" />
                  </div>
                  <button type="submit" className="btn btn-primary">Add Course</button>
                </form>
              </div>
              <div className="dash-section">
                <div className="dash-section-title">📋 My Courses</div>
                {courses.length === 0 ? (
                  <div className="empty-state"><div className="empty-icon">📚</div><p>No courses yet.</p></div>
                ) : (
                  <table className="data-table">
                    <thead><tr><th>#</th><th>Title</th><th>Description</th><th>Action</th></tr></thead>
                    <tbody>
                      {courses.map((c, i) => (
                        <tr key={c.id}>
                          <td>{i + 1}</td>
                          <td><b>{c.title}</b></td>
                          <td style={{ color: 'var(--text-light)', maxWidth: 300 }}>{c.description}</td>
                          <td><button className="btn btn-danger btn-sm" onClick={() => handleDeleteCourse(c.id)}>Delete</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ---- LESSONS TAB ---- */}
          {tab === 'lessons' && (
            <div>
              <div className="admin-form">
                <h3>🎥 Add Lesson / Video</h3>
                {lessonMsg && <div className="success-msg">{lessonMsg}</div>}
                <div className="form-group">
                  <label>Select Course</label>
                  <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
                    <option value="">-- Select a Course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                {selectedCourse && (
                  <form onSubmit={handleAddLesson}>
                    <div className="form-group">
                      <label>Lesson Title</label>
                      <input value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                        placeholder="e.g. Introduction to Variables" required />
                    </div>
                    <div className="form-group">
                      <label>Lesson Content / Notes</label>
                      <textarea value={lessonForm.content} onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })}
                        placeholder="Write lesson notes or description..." />
                    </div>
                    <div className="form-group">
                      <label>Video URL (YouTube watch link or embed URL)</label>
                      <input value={lessonForm.videoUrl} onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..." />
                      {lessonForm.videoUrl && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: '0.3rem' }}>
                          ✅ Embed URL: {toEmbedUrl(lessonForm.videoUrl)}
                        </div>
                      )}
                    </div>
                    <button type="submit" className="btn btn-primary">Add Lesson</button>
                  </form>
                )}
              </div>
              {selectedCourse && (
                <div className="dash-section">
                  <div className="dash-section-title">📋 Lessons in this Course</div>
                  {lessons.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">🎬</div><p>No lessons yet.</p></div>
                  ) : (
                    <table className="data-table">
                      <thead><tr><th>#</th><th>Title</th><th>Video URL</th><th>Action</th></tr></thead>
                      <tbody>
                        {lessons.map((l, i) => (
                          <tr key={l.id}>
                            <td>{i + 1}</td>
                            <td><b>{l.title}</b></td>
                            <td style={{ color: 'var(--text-light)', fontSize: '0.8rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {l.videoUrl || '—'}
                            </td>
                            <td><button className="btn btn-danger btn-sm" onClick={() => handleDeleteLesson(l.id)}>Delete</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ---- QUIZZES TAB ---- */}
          {tab === 'quizzes' && (
            <div>
              <div className="admin-form">

                {/* STEP 1: Quiz Title */}
                {quizStep === 'title' && (
                  <>
                    <h3>📝 Create Quiz</h3>
                    {quizMsg && <div className="success-msg">{quizMsg}</div>}
                    <div className="form-group">
                      <label>Select Course</label>
                      <select value={quizCourse} onChange={e => { setQuizCourse(e.target.value); setQuizMsg('') }}>
                        <option value="">-- Select a Course --</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>
                    {quizCourse && (
                      <form onSubmit={handleCreateQuizTitle}>
                        <div className="form-group">
                          <label>Quiz Title</label>
                          <input value={quizForm.title} onChange={e => setQuizForm({ title: e.target.value })}
                            placeholder="e.g. Chapter 1 Quiz" required />
                        </div>
                        <button type="submit" className="btn btn-primary">Next: Add Questions →</button>
                      </form>
                    )}
                  </>
                )}

                {/* STEP 2: Add Questions */}
                {quizStep === 'questions' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <h3 style={{ margin: 0 }}>📝 Add Questions</h3>
                        <div style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginTop: '0.2rem' }}>Quiz: <b>{createdQuizTitle}</b></div>
                      </div>
                      <button className="btn btn-outline btn-sm" onClick={resetQuizBuilder}>✕ Cancel</button>
                    </div>

                    {questions.map((q, qi) => (
                      <div key={qi} style={{
                        background: 'var(--bg)', border: '1.5px solid var(--border)',
                        borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1.25rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <b style={{ color: 'var(--primary)' }}>Question {qi + 1}</b>
                          {questions.length > 1 && (
                            <button className="btn btn-danger btn-sm" onClick={() => removeQuestion(qi)}>Remove</button>
                          )}
                        </div>

                        <div className="form-group">
                          <label>Question Text</label>
                          <textarea value={q.text} rows={2}
                            onChange={e => updateQuestion(qi, 'text', e.target.value)}
                            placeholder="Enter your question here..." />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-light)', display: 'block', marginBottom: '0.5rem' }}>
                            Options — click the radio button to mark the correct answer
                          </label>
                          {q.options.map((opt, oi) => (
                            <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                              <input
                                type="radio"
                                name={`correct-${qi}`}
                                checked={opt.correct}
                                onChange={() => updateOption(qi, oi, 'correct', true)}
                                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#22c55e' }}
                                title="Mark as correct answer"
                              />
                              <input
                                type="text"
                                value={opt.text}
                                onChange={e => updateOption(qi, oi, 'text', e.target.value)}
                                placeholder={`Option ${oi + 1}`}
                                style={{
                                  flex: 1,
                                  padding: '0.45rem 0.75rem',
                                  border: `1.5px solid ${opt.correct ? '#22c55e' : 'var(--border)'}`,
                                  borderRadius: 'var(--radius)',
                                  fontSize: '0.9rem',
                                  background: opt.correct ? '#f0fff4' : 'white',
                                  outline: 'none'
                                }}
                              />
                              {opt.correct && (
                                <span style={{ color: '#16a34a', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' }}>✅ Correct</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      <button className="btn btn-outline" onClick={addQuestion}>➕ Add Another Question</button>
                      <button className="btn btn-primary" onClick={handleSaveQuestions} disabled={savingQuestions}>
                        {savingQuestions ? 'Saving...' : `💾 Save Quiz (${questions.length} Question${questions.length !== 1 ? 's' : ''})`}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {quizCourse && (
                <div className="dash-section">
                  <div className="dash-section-title">📋 Quizzes in this Course</div>
                  {quizzes.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">📝</div><p>No quizzes yet.</p></div>
                  ) : (
                    <table className="data-table">
                      <thead><tr><th>#</th><th>Quiz Title</th><th>Questions</th><th>Action</th></tr></thead>
                      <tbody>
                        {quizzes.map((q, i) => (
                          <tr key={q.id}>
                            <td>{i + 1}</td>
                            <td><b>{q.title}</b></td>
                            <td>{q.questions ? q.questions.length : 0} questions</td>
                            <td><button className="btn btn-danger btn-sm" onClick={() => handleDeleteQuiz(q.id)}>Delete</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
