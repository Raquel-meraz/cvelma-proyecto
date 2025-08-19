import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const navigate = useNavigate()

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

  const handleEmailChange = e => {
    const value = e.target.value
    setEmail(value)
    if (!value) setEmailError('Dato obligatorio')
    else setEmailError('')
  }

  const handlePasswordChange = e => {
    const value = e.target.value
    setPassword(value)
    if (!value) setPasswordError('Dato obligatorio')
    else setPasswordError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

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

    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (res.ok && data.user) {
        // guardamos id además de rol y logeado
        localStorage.setItem('id', data.user.id)
        localStorage.setItem('logeado', 'true')
        localStorage.setItem('rol', data.user.rol)
        navigate('/home')
      } else {
        setError(data.message || 'Error al iniciar sesión')
      }
    } catch (err) {
      console.error(err)
      setError('Error de red, intenta de nuevo')
    }
  }

  return (
    <div className="login-card">
      <h2 className="login-title">Iniciar Sesión</h2>
      <form onSubmit={handleLogin} autoComplete="off">
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
        {emailError && <div className="login-form-error">{emailError}</div>}

        <label className="login-label">
          Contraseña
          <input
            className="login-input"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Contraseña"
            autoComplete="current-password"
          />
        </label>
        {passwordError && <div className="login-form-error">{passwordError}</div>}

        <button type="submit" className="login-btn">Entrar</button>
      </form>
      {error && <div className="login-main-error">{error}</div>}
      <p className="login-register">
        ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
      </p>
    </div>
  )
}
