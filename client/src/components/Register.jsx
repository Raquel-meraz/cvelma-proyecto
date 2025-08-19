import { useState } from 'react'
import '../styles/Register.css'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [formMessage, setFormMessage] = useState('')

  const dominioValido = '@gmail.com'

  function esCorreoValido(correo) {
    return correo.trim().toLowerCase().endsWith(dominioValido)
  }

  function esPasswordValida(pass) {
    return (
      pass.length >= 8 &&
      /[A-Z]/.test(pass) &&
      /[^A-Za-z0-9]/.test(pass)
    )
  }

  // Solo mensaje "Dato obligatorio" si está vacío mientras escribes
  const handleEmailChange = e => {
    const value = e.target.value
    setEmail(value)
    if (!value) {
      setEmailError('Dato obligatorio')
    } else {
      setEmailError('')
    }
  }

  const handlePasswordChange = e => {
    const value = e.target.value
    setPassword(value)
    if (!value) {
      setPasswordError('Dato obligatorio')
    } else {
      setPasswordError('')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setFormMessage('')

    let valido = true

    if (!email) {
      setEmailError('Dato obligatorio')
      valido = false
    } else if (!esCorreoValido(email)) {
      setEmailError('El correo debe terminar con @gmail.com')
      valido = false
    } else {
      setEmailError('')
    }

    if (!password) {
      setPasswordError('Dato obligatorio')
      valido = false
    } else if (!esPasswordValida(password)) {
      setPasswordError('Mínimo 8 caracteres, al menos una mayúscula, al menos un carácter especial')
      valido = false
    } else {
      setPasswordError('')
    }

    if (!valido) return

    const res = await fetch('http://localhost:3001/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setFormMessage(data.message)
  }

  return (
    <div className="login-card">
      <h2 className="login-title">Registro</h2>
      <form onSubmit={handleRegister} autoComplete="off">
        <label className="login-label">
          Correo
          <input
            className="login-input"
            value={email}
            onChange={handleEmailChange}
            placeholder="Correo"
            autoComplete="username"
            type="email"
          />
        </label>
        {emailError && (
          <div className="login-form-error">{emailError}</div>
        )}

        <label className="login-label">
          Contraseña
          <input
            className="login-input"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Contraseña"
            autoComplete="new-password"
          />
        </label>
        {passwordError && (
          <div className="login-form-error">{passwordError}</div>
        )}

        <button type="submit" className="login-btn">Registrarse</button>
      </form>
      {formMessage && <div className="login-main-error">{formMessage}</div>}
      <p className="login-register">
        ¿Ya tienes cuenta? <a href="/">Inicia sesión</a>
      </p>
    </div>
  )
}
