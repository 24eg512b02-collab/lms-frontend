import axios from 'axios'

const BASE = '/api'

function authHeader() {
  const token = localStorage.getItem('lmsToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// AUTH
export const register = (data) => axios.post(`${BASE}/auth/register`, data)
export const login = (data) => axios.post(`${BASE}/auth/login`, data)

// COURSES
export const getAllCourses = () => axios.get(`${BASE}/courses`, { headers: authHeader() })
export const getCourseById = (id) => axios.get(`${BASE}/courses/${id}`, { headers: authHeader() })
export const getCoursesByInstructor = (userId) => axios.get(`${BASE}/courses/instructor/${userId}`, { headers: authHeader() })
export const addCourse = (data, userId) => axios.post(`${BASE}/courses?userId=${userId}`, data, { headers: authHeader() })
export const updateCourse = (id, data) => axios.put(`${BASE}/courses/${id}`, data, { headers: authHeader() })
export const deleteCourse = (id) => axios.delete(`${BASE}/courses/${id}`, { headers: authHeader() })

// LESSONS
export const getLessonsByCourse = (courseId) => axios.get(`${BASE}/lessons/course/${courseId}`, { headers: authHeader() })
export const addLesson = (data) => axios.post(`${BASE}/lessons`, data, { headers: authHeader() })
export const deleteLesson = (id) => axios.delete(`${BASE}/lessons/${id}`, { headers: authHeader() })

// QUIZZES
export const getQuizzesByCourse = (courseId) => axios.get(`${BASE}/quizzes/course/${courseId}`, { headers: authHeader() })
export const getQuizById = (id) => axios.get(`${BASE}/quizzes/${id}`, { headers: authHeader() })
export const createQuiz = (data) => axios.post(`${BASE}/quizzes`, data, { headers: authHeader() })
export const addQuestionsToQuiz = (quizId, questions) => axios.post(`${BASE}/quizzes/${quizId}/questions`, questions, { headers: authHeader() })
export const submitQuiz = (quizId, answers) => axios.post(`${BASE}/quizzes/${quizId}/submit`, answers, { headers: authHeader() })
export const deleteQuiz = (id) => axios.delete(`${BASE}/quizzes/${id}`, { headers: authHeader() })

// ENROLLMENTS
export const enrollCourse = (userId, courseId) =>
  axios.post(`${BASE}/enroll`, { user: { id: userId }, course: { id: courseId } }, { headers: authHeader() })
export const getUserEnrollments = (userId) => axios.get(`${BASE}/enroll/user/${userId}`, { headers: authHeader() })
export const checkEnrollment = (userId, courseId) => axios.get(`${BASE}/enroll/check/${userId}/${courseId}`, { headers: authHeader() })
export const completeCourse = (userId, courseId, score, total) =>
  axios.put(`${BASE}/enroll/complete/${userId}/${courseId}?score=${score}&total=${total}`, {}, { headers: authHeader() })

// USERS
export const getUserById = (id) => axios.get(`${BASE}/users/${id}`, { headers: authHeader() })
