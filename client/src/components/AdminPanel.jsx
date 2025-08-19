import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/AdminPanel.css';

const ROLES = [
  { value: "usuario", label: "Usuario" },
  { value: "admin", label: "Administrador" },
  { value: "encargado", label: "Encargado" },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [editando, setEditando] = useState({});
  const usuarioActualId = localStorage.getItem('id');
  const [mensajes, setMensajes] = useState([]);
  const [cargandoMensajes, setCargandoMensajes] = useState(true);

  // Carga usuarios
  useEffect(() => {
    fetch("http://localhost:3001/api/usuarios")
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setUsuarios(Array.isArray(data) ? data : []);
        setCargando(false);
      });
  }, []);

  // Carga mensajes en tiempo real
  useEffect(() => {
    const cargarMensajes = () => {
      fetch("http://localhost:3001/api/mensajes")
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          setMensajes(Array.isArray(data) ? data : []);
          setCargandoMensajes(false);
        });
    };
    cargarMensajes();
    const interval = setInterval(cargarMensajes, 7000); // cada 7 segundos
    return () => clearInterval(interval);
  }, []);

  // Actualiza el select
  const handleRolChange = (id, nuevoRol) => {
    setEditando(editando => ({ ...editando, [id]: nuevoRol }));
  };

  // Aplica el cambio y actualiza el rol del usuario en tiempo real
  const guardarRol = async (id) => {
    const nuevoRol = editando[id];
    if (!nuevoRol) return;
    setMensaje('');
    try {
      const res = await fetch(`http://localhost:3001/api/usuarios/${id}/rol`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rol: nuevoRol }),
      });
      const data = await res.json();
      setMensaje(data.message || 'Rol actualizado');
      setUsuarios(usuarios =>
        usuarios.map(u =>
          u.id === id ? { ...u, rol: nuevoRol } : u
        )
      );
      setEditando(editando => {
        const nuevoEditando = { ...editando };
        delete nuevoEditando[id];
        return nuevoEditando;
      });

      // Si cambié mi propio usuario, actualiza localStorage y notifica Home
      if (id === usuarioActualId) {
        localStorage.setItem('rol', nuevoRol);
        window.dispatchEvent(new Event('rolActualizado'));
      }
    } catch {
      setMensaje("Error al actualizar el rol");
    }
  };

  return (
    <div className="admin-panel-container" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <nav className="admin-panel-navbar">
        <span className="admin-panel-title">Panel de Administración</span>
        <button onClick={() => navigate('/home')} className="admin-panel-back-btn">
          Volver a la tienda
        </button>
      </nav>
      <div style={{ display: "flex", flex: 1, width: "100%", alignItems: "stretch", justifyContent: "stretch" }}>
        {/* IZQUIERDA: Gestión de usuarios */}
        <main
          className="admin-panel-main"
          style={{
            flex: "1 1 60%",
            minWidth: 0,
            borderRight: "1px solid #eee",
            padding: "2vw 2vw 2vw 3vw",
            background: "#fafcff"
          }}>
          <section className="admin-panel-section">
            <h2>Gestión de Usuarios</h2>
            {cargando ? (
              <div>Cargando usuarios...</div>
            ) : usuarios.length === 0 ? (
              <div>No hay usuarios.</div>
            ) : (
              <div style={{
                maxHeight: "55vh",
                overflowY: "auto",
                borderRadius: 10,
                boxShadow: "0 2px 12px #0001",
                background: "#fff"
              }}>
                <table className="admin-usuarios-table" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Correo</th>
                      <th>Rol actual</th>
                      <th>Cambiar rol</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map(u => (
                      <tr key={u.id}>
                        <td>{u.email}</td>
                        <td style={{ textTransform: "capitalize" }}>{u.rol}</td>
                        <td>
                          <select
                            value={editando[u.id] ?? u.rol}
                            onChange={e => handleRolChange(u.id, e.target.value)}
                            className="admin-rol-select"
                          >
                            {ROLES.map(r =>
                              <option key={r.value} value={r.value}>{r.label}</option>
                            )}
                          </select>
                        </td>
                        <td>
                          <button
                            className="admin-btn-guardar-rol"
                            onClick={() => guardarRol(u.id)}
                            disabled={!editando[u.id] || editando[u.id] === u.rol}
                            style={{ opacity: (!editando[u.id] || editando[u.id] === u.rol) ? 0.5 : 1 }}
                          >
                            Guardar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {mensaje && <div className="admin-panel-mensaje">{mensaje}</div>}
          </section>
        </main>
        {/* DERECHA: Mensajes */}
        <aside
          style={{
            flex: "1 1 40%",
            minWidth: 0,
            padding: "2vw",
            background: "#f8fafb",
            overflowY: "auto",
            borderLeft: "1px solid #eee"
          }}>
          <h2 style={{ marginTop: 0 }}>Mensajes recibidos</h2>
          {cargandoMensajes ? (
            <div>Cargando mensajes...</div>
          ) : mensajes.length === 0 ? (
            <div>No hay mensajes.</div>
          ) : (
            <ul style={{
              listStyle: "none",
              padding: 0,
              maxHeight: "70vh",
              overflowY: "auto"
            }}>
              {mensajes.map((msg, idx) => (
                <li key={msg.id || idx} style={{
                  background: "#fff",
                  borderRadius: 10,
                  marginBottom: 18,
                  padding: "1em",
                  boxShadow: "0 2px 12px #0001"
                }}>
                  <div style={{ fontWeight: 500, color: "#223", marginBottom: 6 }}>
                    <span style={{ color: "#28619e" }}>De:</span> {msg.nombre}
                  </div>
                  <div style={{ whiteSpace: "pre-line", color: "#444" }}>
                    {msg.mensaje}
                  </div>
                  <div style={{ fontSize: 12, color: "#789", marginTop: 7 }}>
                    {msg.fecha ? new Date(msg.fecha).toLocaleString() : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
