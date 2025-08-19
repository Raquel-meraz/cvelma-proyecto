const pool = require('../config/db');

// CREAR publicación (recibe usuario_id)
const crearPublicacion = async ({
  titulo,
  imagenes_url = [],
  descripcion,
  talla,
  precio,
  estado,
  ubicacion,
  contacto,
  entrega,
  usuario_id
}) => {
  if (!usuario_id) {
    throw new Error("Debe proporcionarse usuario_id para crear la publicación");
  }

  // Si imagenes_url viene como string (ejemplo cuando se edita), conviértelo a arreglo
  if (typeof imagenes_url === 'string') {
    try {
      imagenes_url = JSON.parse(imagenes_url || "[]");
    } catch {
      imagenes_url = [];
    }
  }
  if (!Array.isArray(imagenes_url)) imagenes_url = [];

  try {
    const { rows } = await pool.query(
      `INSERT INTO publicaciones (
         titulo,
         imagenes_url,
         descripcion,
         talla,
         precio,
         estado,
         ubicacion,
         contacto,
         entrega,
         usuario_id
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
       )
       RETURNING *;`,
      [
        titulo.trim(),
        imagenes_url, // <-- Array puro para text[]
        descripcion.trim(),
        talla.trim(),
        precio,
        estado.trim(),
        ubicacion.trim(),
        contacto.trim(),
        entrega.trim(),
        usuario_id
      ]
    );

    return rows[0];
  } catch (error) {
    console.error('Error creando publicación:', error);
    throw new Error('Error al crear publicación');
  }
};

// OBTENER todas las publicaciones junto con info básica del usuario creador
const obtenerPublicacionesConUsuario = async () => {
  const res = await pool.query(`
    SELECT
      p.*,
      u.email    AS usuario_email,
      u.rol      AS usuario_rol
    FROM publicaciones p
    LEFT JOIN usuarios u 
      ON p.usuario_id = u.id
    ORDER BY p.id DESC;
  `);

  return res.rows.map(pub => ({
    ...pub,
    imagenes_url: Array.isArray(pub.imagenes_url)
      ? pub.imagenes_url
      : typeof pub.imagenes_url === 'string'
        ? JSON.parse(pub.imagenes_url)
        : []
  }));
};

// OBTENER publicación por id (usada para editar/eliminar)
const obtenerPublicacionPorId = async (id) => {
  const res = await pool.query(
    'SELECT * FROM publicaciones WHERE id = $1',
    [id]
  );
  if (res.rows.length === 0) return null;

  const pub = res.rows[0];
  return {
    ...pub,
    imagenes_url: Array.isArray(pub.imagenes_url)
      ? pub.imagenes_url
      : typeof pub.imagenes_url === 'string'
        ? JSON.parse(pub.imagenes_url)
        : []
  };
};

// ELIMINAR publicación por id
const eliminarPublicacion = async (id) => {
  // Verifica si la publicación existe antes de eliminarla
  const { rows: existingRows } = await pool.query(
    `SELECT * FROM publicaciones WHERE id = $1;`,
    [id]
  );
  if (existingRows.length === 0) {
    throw new Error('Publicación no encontrada');
  }

  const res = await pool.query(
    `DELETE FROM publicaciones WHERE id = $1;`,
    [id]
  );
  return res.rowCount;
};

// ACTUALIZAR publicación por id (no permite cambiar usuario_id)
const actualizarPublicacion = async (id, {
  titulo,
  imagenes_url = [],
  descripcion,
  talla,
  precio,
  estado,
  ubicacion,
  contacto,
  entrega
}) => {
  // Verifica si la publicación existe antes de actualizarla
  const { rows: existingRows } = await pool.query(
    `SELECT * FROM publicaciones WHERE id = $1;`,
    [id]
  );
  if (existingRows.length === 0) {
    throw new Error('Publicación no encontrada');
  }

  // ARREGLO CORRECTO: Convierte a array si viene como string
  if (typeof imagenes_url === 'string') {
    try {
      imagenes_url = JSON.parse(imagenes_url || "[]");
    } catch {
      imagenes_url = [];
    }
  }
  if (!Array.isArray(imagenes_url)) imagenes_url = [];

  try {
    const { rows } = await pool.query(
      `UPDATE publicaciones SET
         titulo       = $1,
         imagenes_url = $2,
         descripcion  = $3,
         talla        = $4,
         precio       = $5,
         estado       = $6,
         ubicacion    = $7,
         contacto     = $8,
         entrega      = $9
       WHERE id = $10
       RETURNING *;`,
      [
        titulo.trim(),
        imagenes_url, // <-- Array puro para text[]
        descripcion.trim(),
        talla.trim(),
        precio,
        estado.trim(),
        ubicacion.trim(),
        contacto.trim(),
        entrega.trim(),
        id
      ]
    );

    return rows[0];
  } catch (error) {
    console.error('Error actualizando publicación:', error);
    throw new Error('Error al actualizar publicación');
  }
};

module.exports = {
  crearPublicacion,
  obtenerPublicacionesConUsuario,
  eliminarPublicacion,
  actualizarPublicacion,
  obtenerPublicacionPorId
};
