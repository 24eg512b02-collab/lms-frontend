import React from 'react'

export default function Footer() {
  return (
    <footer className="footer">
      <h3>🎓 LearnHub</h3>
      <p>Empowering learners worldwide with quality education.</p>
      <p style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
        © {new Date().getFullYear()} LearnHub by EduTech Solutions Pvt. Ltd. All rights reserved.
      </p>
    </footer>
  )
}
