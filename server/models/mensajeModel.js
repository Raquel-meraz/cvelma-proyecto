const pool = require('../config/db');

// Crea un mensaje (con nombre, mensaje y opcionalmente id_usuario)
const crearMensaje = async ({ nombre, mensaje, id_usuario = null }) => {
  // Si se proporciona id_usuario, insertarlo, de lo contrario, se usa null
  try {
    // Si id_usuario es null, lo dejamos como null en la base de datos
    const query = 'INSERT INTO mensajes (nombre, mensaje, id_usuario) VALUES ($1, $2, $3)';
    await pool.query(query, [nombre, mensaje, id_usuario]);
  } catch (error) {
    console.error('Error al crear mensaje:', error);
    throw new Error('Error al insertar el mensaje');
  }
};

// Obtiene todos los mensajes, más recientes primero
const obtenerMensajes = async () => {
  try {
    // Ejecutamos la consulta para obtener los mensajes, con la información del usuario
    const query = `
      SELECT m.*, u.email AS usuario_email
      FROM mensajes m
      LEFT JOIN usuarios u ON m.id_usuario = u.id
      ORDER BY m.fecha DESC;
    `;
    const res = await pool.query(query);
    
    // Si no hay resultados, retornamos un arreglo vacío
    return res.rows.length ? res.rows : [];
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    throw new Error('Error al obtener los mensajes');
  }
};

module.exports = {
  crearMensaje,
  obtenerMensajes
};
