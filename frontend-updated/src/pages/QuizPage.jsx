import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { getQuizById, submitQuiz, completeCourse } from '../api.js'

export default function QuizPage() {
  const { quizId, courseId } = useParams()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('lmsUser') || '{}')

  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})   // { questionId: selectedOptionId }
  const [result, setResult] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [barWidth, setBarWidth] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const res = await getQuizById(quizId)
        setQuiz(res.data)
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    load()
  }, [quizId])

  // Animate progress bar after result
  useEffect(() => {
    if (result) {
      setTimeout(() => setBarWidth(result.percentage), 100)
    }
  }, [result])

  function selectOption(questionId, optionId) {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [questionId]: optionId }))
  }

  async function handleSubmit() {
    if (!quiz) return
    const unanswered = quiz.questions.filter(q => !answers[q.id])
    if (unanswered.length > 0) {
      alert(`Please answer all ${unanswered.length} remaining question(s) before submitting.`)
      return
    }
    setSubmitting(true)

    // Convert { questionId: optionId } — keys/values must be numbers
    const payload = {}
    Object.keys(answers).forEach(k => { payload[Number(k)] = Number(answers[k]) })

    try {
      const res = await submitQuiz(quizId, payload)
      setResult(res.data)
      setSubmitted(true)

      // Mark course as completed with score
      await completeCourse(user.id, courseId, res.data.score, res.data.total)
    } catch (err) {
      console.error(err)
      alert('Error submitting quiz. Please try again.')
    }
    setSubmitting(false)
  }

  function getOptionClass(question, option) {
    if (!submitted) {
      return answers[question.id] === option.id ? 'option-btn selected' : 'option-btn'
    }
    if (option.correct) return 'option-btn correct'
    if (answers[question.id] === option.id && !option.correct) return 'option-btn wrong'
    return 'option-btn'
  }

  if (loading) return (
    <div><Navbar /><div className="loader"><div className="spinner"></div>Loading quiz...</div></div>
  )

  if (!quiz) return (
    <div><Navbar /><div className="empty-state"><p>Quiz not found.</p></div></div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div className="quiz-wrapper">

        {/* Quiz Header */}
        <div className="quiz-header">
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.5rem' }}>
            <span onClick={() => navigate(`/course/${courseId}`)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              ← Back to Course
            </span>
          </div>
          <h2 style={{ fontWeight: 800 }}>{quiz.title}</h2>
          <p style={{ opacity: 0.85, marginTop: '0.25rem' }}>{quiz.questions?.length} Questions</p>
        </div>

        {/* RESULT VIEW */}
        {submitted && result && (
          <div className="progress-result" style={{ marginBottom: '2rem' }}>
            <h3>{result.passed ? '🎉 Congratulations!' : '😓 Keep Practicing!'}</h3>
            <p style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>
              {result.passed ? 'You passed the quiz!' : 'You need 60% or more to pass.'}
            </p>

            {/* Score Circle */}
            <div className={`progress-circle ${result.passed ? 'pass' : 'fail'}`}>
              {result.percentage}%
            </div>

            {/* Correct Progress Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>✅ Correct</span>
                <span>{result.score}/{result.total}</span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill correct-bar" style={{ width: `${barWidth}%` }} />
              </div>
            </div>

            {/* Wrong Progress Bar */}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>❌ Wrong</span>
                <span>{result.wrong}/{result.total}</span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill wrong-bar"
                  style={{ width: `${100 - barWidth}%` }} />
              </div>
            </div>

            {/* Stats */}
            <div className="progress-stats">
              <div className="progress-stat">
                <div className="val correct-val">{result.score}</div>
                <div className="lbl">Correct</div>
              </div>
              <div className="progress-stat">
                <div className="val wrong-val">{result.wrong}</div>
                <div className="lbl">Wrong</div>
              </div>
              <div className="progress-stat">
                <div className="val" style={{ color: 'var(--primary)' }}>{result.total}</div>
                <div className="lbl">Total</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-outline" onClick={() => navigate(`/course/${courseId}`)}>
                Back to Course
              </button>
              <button className="btn btn-primary" onClick={() => navigate(user.role === 'ADMIN' ? '/admin' : '/student')}>
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* QUESTIONS */}
        {quiz.questions && quiz.questions.map((question, qi) => (
          <div className="question-card" key={question.id}>
            <div className="question-text">
              Q{qi + 1}. {question.text}
            </div>
            <div className="options-list">
              {question.options && question.options.map(option => (
                <button
                  key={option.id}
                  className={getOptionClass(question, option)}
                  onClick={() => selectOption(question.id, option.id)}
                  disabled={submitted}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Submit Button */}
        {!submitted && (
          <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '2rem' }}>
            <div style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              Answered: {Object.keys(answers).length} / {quiz.questions?.length}
            </div>
            <button className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', fontSize: '1rem' }}
              onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : '🚀 Submit Quiz'}
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
