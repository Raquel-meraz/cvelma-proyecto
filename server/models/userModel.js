const pool = require('../config/db');

// Buscar usuario por email
const findUserByEmail = async (email) => {
  const res = await pool.query(
    'SELECT * FROM usuarios WHERE email = $1 LIMIT 1',
    [email]
  );
  return res.rows[0]; // undefined si no existe
};

// Buscar usuario por ID (útil para relaciones)
const findUserById = async (id) => {
  const res = await pool.query(
    'SELECT * FROM usuarios WHERE id = $1 LIMIT 1',
    [id]
  );
  return res.rows[0]; // undefined si no existe
};

// Crear usuario, rol por default: 'usuario'
const createUser = async (email, hashedPassword, rol = 'usuario') => {
  await pool.query(
    'INSERT INTO usuarios (email, password, rol) VALUES ($1, $2, $3)',
    [email, hashedPassword, rol]
  );
};

// Listar todos los usuarios (para AdminPanel)
const getAllUsers = async () => {
  const res = await pool.query(
    'SELECT id, email, rol, fecha_registro FROM usuarios ORDER BY id'
  );
  return res.rows;
};

// Cambiar el rol de un usuario (admin/usuario/encargado)
const updateUserRol = async (id, rol) => {
  const rolesValidos = ['admin', 'usuario', 'encargado'];
  if (!rolesValidos.includes(rol)) {
    throw new Error('Rol inválido');
  }
  await pool.query(
    'UPDATE usuarios SET rol = $1 WHERE id = $2',
    [rol, id]
  );
};

module.exports = {
  findUserByEmail,
  findUserById,  // para relaciones o joins
  createUser,
  getAllUsers,
  updateUserRol,
};
