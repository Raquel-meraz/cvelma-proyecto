import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Home.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const UPLOADS_URL = API_BASE.replace(/\/api$/, '');

export default function Home() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [titulo, setTitulo] = useState("");
  const [imagenes, setImagenes] = useState(null); // Solo un archivo
  const [imagenesActuales, setImagenesActuales] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [talla, setTalla] = useState("");
  const [precio, setPrecio] = useState("");
  const [estado, setEstado] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [contacto, setContacto] = useState("");
  const [entrega, setEntrega] = useState("");
  const [publicaciones, setPublicaciones] = useState([]);
  const [publicacionesFiltradas, setPublicacionesFiltradas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalPub, setModalPub] = useState(null);

  // Filtros
  const [filtroTalla, setFiltroTalla] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');

  // Contacto
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [mensajeExitoComentario, setMensajeExitoComentario] = useState("");

  // Para edición
  const [editandoId, setEditandoId] = useState(null);

  // Rol sincronizado con localStorage
  const [rol, setRol] = useState(localStorage.getItem('rol'));

  // Texto de archivo seleccionado
  const [selectedFilesText, setSelectedFilesText] = useState("");

  // Mensajes de éxito
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeEliminar, setMensajeEliminar] = useState("");
  // Modal para confirmar eliminar
  const [publicacionAEliminar, setPublicacionAEliminar] = useState(null);

  // Campo obligatorio para imagen (solo cuando intentan publicar sin imagen)
  const [showImagenObligatoriaMsg, setShowImagenObligatoriaMsg] = useState(false);

  // --- PAGINACIÓN ---
  const [paginaActual, setPaginaActual] = useState(1);
  const publicacionesPorPagina = 10;
  const totalPaginas = Math.ceil(publicacionesFiltradas.length / publicacionesPorPagina);

  const publicacionesPagina = publicacionesFiltradas.slice(
    (paginaActual - 1) * publicacionesPorPagina,
    paginaActual * publicacionesPorPagina
  );

  const cambiarPagina = (num) => {
    if (num < 1) num = 1;
    if (num > totalPaginas) num = totalPaginas;
    setPaginaActual(num);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPaginasVisibles = () => {
    const paginas = [];
    const maxBotones = 7;
    let inicio = Math.max(1, paginaActual - Math.floor(maxBotones / 2));
    let fin = inicio + maxBotones - 1;
    if (fin > totalPaginas) {
      fin = totalPaginas;
      inicio = Math.max(1, fin - maxBotones + 1);
    }
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  };
  // --- FIN PAGINACIÓN ---

  // Verificar autenticación
  useEffect(() => {
    if (localStorage.getItem('logeado') !== 'true') {
      navigate('/');
    }
  }, [navigate]);

  // Sincronizar rol
  useEffect(() => {
    const syncRol = () => setRol(localStorage.getItem('rol'));
    window.addEventListener('rolActualizado', syncRol);
    window.addEventListener('storage', syncRol);
    window.addEventListener('focus', syncRol);
    return () => {
      window.removeEventListener('rolActualizado', syncRol);
      window.removeEventListener('storage', syncRol);
      window.removeEventListener('focus', syncRol);
    };
  }, []);

  // Cargar publicaciones
  const cargarPublicaciones = () => {
    fetch(`${API_BASE}/publicaciones`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const lista = Array.isArray(data) ? data : [];
        setPublicaciones(lista);
        setPublicacionesFiltradas(lista);
      })
      .catch(() => {
        setPublicaciones([]);
        setPublicacionesFiltradas([]);
      });
  };

  useEffect(cargarPublicaciones, []);

  // Filtros y búsqueda
  useEffect(() => {
    let filtradas = publicaciones;
    const filtro = busqueda.trim().toLowerCase();
    if (filtro) {
      filtradas = filtradas.filter(pub =>
        pub.titulo?.toLowerCase().includes(filtro) ||
        pub.descripcion?.toLowerCase().includes(filtro)
      );
    }
    if (filtroTalla) {
      filtradas = filtradas.filter(pub =>
        pub.talla?.toLowerCase() === filtroTalla.toLowerCase()
      );
    }
    filtradas = filtradas.filter(pub => {
      const precioNum = parseFloat(pub.precio) || 0;
      if (precioMin && precioNum < parseFloat(precioMin)) return false;
      if (precioMax && precioNum > parseFloat(precioMax)) return false;
      return true;
    });
    setPublicacionesFiltradas(filtradas);
    setPaginaActual(1); // resetear página al cambiar filtros o búsqueda
  }, [busqueda, publicaciones, filtroTalla, precioMin, precioMax]);

  // Limpiar formulario
  const limpiarFormulario = () => {
    setEditandoId(null);
    setTitulo(""); setImagenes(null); setDescripcion(""); setTalla("");
    setPrecio(""); setEstado(""); setUbicacion(""); setContacto(""); setEntrega("");
    setImagenesActuales([]);
    setSelectedFilesText("");
    setShowImagenObligatoriaMsg(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Crear / actualizar publicación
  const handleCrear = async (e) => {
    e.preventDefault();

    if (!editandoId && !imagenes) {
      setShowImagenObligatoriaMsg(true);
      setTimeout(() => setShowImagenObligatoriaMsg(false), 2000);
      return;
    }

    const userId = localStorage.getItem('id');
    if (!userId) {
      alert("Por favor inicia sesión de nuevo.");
      return;
    }

    const formData = new FormData();
    formData.append('usuario_id', userId);
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('talla', talla);
    formData.append('precio', precio);
    formData.append('estado', estado);
    formData.append('ubicacion', ubicacion);
    formData.append('contacto', contacto);
    formData.append('entrega', entrega);

    if (imagenes) {
      formData.append('imagenes', imagenes);
    } else if (editandoId) {
      formData.append('imagenes_url', JSON.stringify(imagenesActuales));
    }

    try {
      const url = editandoId
        ? `${API_BASE}/publicaciones/${editandoId}`
        : `${API_BASE}/publicaciones`;

      const method = editandoId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en servidor');

      setMensajeExito(data.message || (editandoId ? 'Actualización exitosa' : 'Publicado con éxito'));

      limpiarFormulario();
      cargarPublicaciones();

      setTimeout(() => setMensajeExito(""), 3000);

    } catch (err) {
      console.error('Error al guardar la publicación:', err);
      alert('Error al guardar publicación. Intenta nuevamente más tarde.');
    }
  };

  // Confirmar eliminar con modal
  const confirmarEliminar = async (id) => {
    setPublicacionAEliminar(null);
    try {
      const res = await fetch(`${API_BASE}/publicaciones/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar');
      setMensajeEliminar(data.message || 'Eliminado correctamente');
      if (editandoId === id) limpiarFormulario();
      cargarPublicaciones();
      setTimeout(() => setMensajeEliminar(""), 2500);
    } catch {
      setMensajeEliminar('Error al eliminar publicación.');
      setTimeout(() => setMensajeEliminar(""), 2500);
    }
  };

  // Preparar edición
  const handleEditar = (pub) => {
    setEditandoId(pub.id);
    setTitulo(pub.titulo); setDescripcion(pub.descripcion); setTalla(pub.talla);
    setPrecio(pub.precio); setEstado(pub.estado); setUbicacion(pub.ubicacion);
    setContacto(pub.contacto); setEntrega(pub.entrega);
    setImagenes(null);
    setImagenesActuales(pub.imagenes_url || []);
    setSelectedFilesText("");
    setShowImagenObligatoriaMsg(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enviar mensaje
  const handleEnviarMensaje = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/mensajes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, mensaje })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar');
      setMensajeExitoComentario(data.message || 'Mensaje enviado correctamente');
      setNombre(''); setMensaje('');
      setTimeout(() => setMensajeExitoComentario(""), 3000);
    } catch {
      setMensajeExitoComentario('Error al enviar mensaje.');
      setTimeout(() => setMensajeExitoComentario(""), 3000);
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };
  const handleGestionar = () => navigate('/admin-panel');

  // Solo permite una imagen
  const handleImagenesChange = (e) => {
    const file = e.target.files[0] || null;
    setImagenes(file);
    setShowImagenObligatoriaMsg(false);
    setSelectedFilesText(file ? file.name : "");
  };

  const abrirModal = (pub) => setModalPub(pub);
  const cerrarModal = () => setModalPub(null);
  const limpiarFiltros = () => { setFiltroTalla(''); setPrecioMin(''); setPrecioMax(''); };

  return (
    <div className="home-container">
      <nav className="navbar">
        <span className="navbar-logo">Tienda de Vestidos</span>
        <input
          className="navbar-search"
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar vestido..."
        />
        {rol === 'admin' && (
          <button
            onClick={handleGestionar}
            className="gestion-btn-navbar"
            type="button"
          >
            Gestionar
          </button>
        )}
        <button
          onClick={handleLogout}
          className="logout-btn-navbar"
          type="button"
        >
          Cerrar sesión
        </button>
      </nav>

      {/* MODAL PARA CONFIRMAR ELIMINAR */}
      {publicacionAEliminar && (
        <div
          className="modal-bg"
          onClick={() => setPublicacionAEliminar(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-eliminar" onClick={e => e.stopPropagation()}>
            <h3>¿Eliminar esta publicación?</h3>
            <div className="eliminar-btns">
              <button
                className="btn-si"
                onClick={() => confirmarEliminar(publicacionAEliminar)}
                type="button"
              >
                Sí, eliminar
              </button>
              <button
                className="btn-no"
                onClick={() => setPublicacionAEliminar(null)}
                type="button"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MENSAJE DE ÉXITO O ELIMINAR */}
      {mensajeEliminar && (
        <div className="mensaje-flotante-eliminar" role="alert">
          {mensajeEliminar}
        </div>
      )}

      {/* MODAL DE DETALLE DE PUBLICACIÓN */}
      {modalPub && (
        <div className="modal-bg" onClick={cerrarModal}>
          <div className="modal-detalle-2col" onClick={e => e.stopPropagation()}>
            <button className="modal-cerrar" onClick={cerrarModal} aria-label="Cerrar">&times;</button>
            <div className="modal-col-img">
              {modalPub.imagenes_url?.[0] && (
                <img
                  src={`${UPLOADS_URL}${modalPub.imagenes_url[0]}`}
                  alt={modalPub.titulo}
                  className="modal-img-principal"
                />
              )}
            </div>
            <div className="modal-col-info">
              <h2>{modalPub.titulo}</h2>
              <p><strong>Descripción:</strong> {modalPub.descripcion}</p>
              <p><strong>Talla:</strong> {modalPub.talla}</p>
              <p><strong>Precio:</strong> ${modalPub.precio} MXN</p>
              <p><strong>Estado:</strong> {modalPub.estado}</p>
              <p><strong>Ubicación:</strong> {modalPub.ubicacion}</p>
              <p><strong>Contacto:</strong> {modalPub.contacto}</p>
              <p><strong>Entrega:</strong> {modalPub.entrega}</p>
            </div>
          </div>
        </div>
      )}

      <div className="filtro-barra">
        <div className="filtro-titulo">Filtrar</div>
        <label className="filtro-label" htmlFor="filtroTalla">Talla:
          <select
            id="filtroTalla"
            value={filtroTalla}
            onChange={e => setFiltroTalla(e.target.value)}
          >
            <option value="">Todas</option>
            <option>XS</option>
            <option>S</option>
            <option>M</option>
            <option>L</option>
            <option>XL</option>
            <option>XXL</option>
          </select>
        </label>
        <label className="filtro-label" htmlFor="precioMin">Precio mínimo:
          <input
            id="precioMin"
            type="number"
            min="0"
            value={precioMin}
            onChange={e => setPrecioMin(e.target.value)}
            placeholder="$"
          />
        </label>
        <label className="filtro-label" htmlFor="precioMax">Precio máximo:
          <input
            id="precioMax"
            type="number"
            min="0"
            value={precioMax}
            onChange={e => setPrecioMax(e.target.value)}
            placeholder="$"
          />
        </label>
        <button
          type="button"
          className="btn-limpiar-filtros"
          onClick={limpiarFiltros}
        >
          Limpiar filtros
        </button>
      </div>

      <main>
        <div className="publicaciones-grid">
          {(rol === 'admin' || rol === 'encargado') && (
            <div className="publicacion-card admin-card" aria-label="Formulario para agregar o editar vestido">
              <h3>{editandoId ? 'Editar publicación' : 'Agregar Vestido'}</h3>
              {editandoId && imagenesActuales.length > 0 && (
                <div className="modal-galeria" aria-label="Imágenes actuales">
                  {imagenesActuales[0] && (
                    <img
                      src={`${UPLOADS_URL}${imagenesActuales[0]}`}
                      alt={`Imagen actual`}
                    />
                  )}
                  <div className="nota-imagenes">
                    Si no subes nueva, se conserva esta.
                  </div>
                </div>
              )}
              <form onSubmit={handleCrear} encType="multipart/form-data">
                <input
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="Título"
                  required
                  aria-required="true"
                />

                <div className="file-upload-container">
                  <input
                    ref={fileInputRef}
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImagenesChange}
                    required={!editandoId}
                    aria-required={!editandoId}
                  />
                  <label htmlFor="fileInput" className="custom-file-label" tabIndex={0} onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                  }}>
                    Elegir archivo
                  </label>
                  <span className="selected-file-text" aria-live="polite">
                    {selectedFilesText || "No hay archivo seleccionado"}
                  </span>
                </div>

                <textarea
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Descripción detallada"
                  required
                  aria-required="true"
                />
                <select
                  value={talla}
                  onChange={e => setTalla(e.target.value)}
                  required
                  aria-required="true"
                >
                  <option value="">Selecciona talla</option>
                  <option>XS</option>
                  <option>S</option>
                  <option>M</option>
                  <option>L</option>
                  <option>XL</option>
                  <option>XXL</option>
                </select>
                <input
                  value={precio}
                  onChange={e => setPrecio(e.target.value)}
                  type="number"
                  min="0"
                  placeholder="Precio (MXN)"
                  required
                  aria-required="true"
                />
                <input
                  value={estado}
                  onChange={e => setEstado(e.target.value)}
                  placeholder="Estado"
                  required
                  aria-required="true"
                />
                <input
                  value={ubicacion}
                  onChange={e => setUbicacion(e.target.value)}
                  placeholder="Ubicación"
                  required
                  aria-required="true"
                />
                <input
                  value={contacto}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '');
                    setContacto(value);
                  }}
                  placeholder="Contacto"
                  type="tel"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  required
                  aria-required="true"
                  maxLength={15}
                />
                <input
                  value={entrega}
                  onChange={e => setEntrega(e.target.value)}
                  placeholder="Entrega"
                  required
                  aria-required="true"
                />
                <button type="submit">
                  {editandoId ? 'Guardar cambios' : 'Publicar'}
                </button>

                {!editandoId && showImagenObligatoriaMsg && (
                  <div className="campo-obligatorio-img" style={{ marginTop: "10px" }} role="alert">
                    * Campo obligatorio: selecciona una imagen
                  </div>
                )}

                {mensajeExito && (
                  <div className="mensaje-exito-publicacion" role="alert">
                    {mensajeExito}
                  </div>
                )}

                {editandoId && (
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={limpiarFormulario}
                  >
                    Cancelar
                  </button>
                )}
              </form>
            </div>
          )}

          {publicacionesPagina.length === 0 ? (
            <p>No hay publicaciones</p>
          ) : (
            publicacionesPagina.map(pub => (
              <div
                key={pub.id}
                className="publicacion-card"
                tabIndex={0}
                role="button"
                onClick={() => abrirModal(pub)}
                onKeyPress={e => {
                  if (e.key === 'Enter' || e.key === ' ') abrirModal(pub);
                }}
                aria-label={`Ver detalles de ${pub.titulo}`}
              >
                {pub.imagenes_url?.[0] && (
                  <img
                    src={`${UPLOADS_URL}${pub.imagenes_url[0]}`}
                    alt={pub.titulo}
                    className="imagen-miniatura"
                  />
                )}
                <h3>{pub.titulo}</h3>
                <div className="precio">${pub.precio} MXN</div>
                {rol === 'admin' && (
                  <div
                    className="admin-acciones"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleEditar(pub)}
                      type="button"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setPublicacionAEliminar(pub.id)}
                      type="button"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* PAGINACIÓN */}
        {totalPaginas > 1 && (
          <nav className="paginacion" aria-label="Navegación de páginas" role="navigation">
            <button onClick={() => cambiarPagina(1)} disabled={paginaActual === 1} aria-label="Primera página">« Primera</button>
            <button onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1} aria-label="Página anterior">‹ Anterior</button>

            {paginaActual > 4 && (
              <>
                <button onClick={() => cambiarPagina(1)}>1</button>
                <span className="puntos">...</span>
              </>
            )}

            {getPaginasVisibles().map(num => (
              <button
                key={num}
                onClick={() => cambiarPagina(num)}
                aria-current={paginaActual === num ? "page" : undefined}
                className={paginaActual === num ? "activo" : ""}
              >
                {num}
              </button>
            ))}

            {paginaActual < totalPaginas - 3 && (
              <>
                <span className="puntos">...</span>
                <button onClick={() => cambiarPagina(totalPaginas)}>{totalPaginas}</button>
              </>
            )}

            <button onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas} aria-label="Página siguiente">Siguiente ›</button>
            <button onClick={() => cambiarPagina(totalPaginas)} disabled={paginaActual === totalPaginas} aria-label="Última página">Última »</button>
          </nav>
        )}

        <form onSubmit={handleEnviarMensaje} className="form-contacto" aria-label="Formulario de comentarios">
          <h2 style={{ marginTop: 40 }}>Comentarios</h2>
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Tu nombre"
            required
            aria-required="true"
          /><br />
          <textarea
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            placeholder="Escribe tu mensaje..."
            required
            aria-required="true"
          /><br />
          <button type="submit">Enviar mensaje</button>
          {mensajeExitoComentario && (
            <div className="mensaje-exito-publicacion" role="alert">
              {mensajeExitoComentario}
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
