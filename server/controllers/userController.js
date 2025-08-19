const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

// Registro de usuario
const register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Correo ya registrado' });
    }
    const hashed = await bcrypt.hash(password, 10);
    await userModel.createUser(email, hashed); // rol por defecto: 'usuario'
    res.status(201).json({ message: 'Registro exitoso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

// Login de usuario
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }
    // Retornamos info básica del usuario sin contraseña
    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

// Listar todos los usuarios (para AdminPanel)
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

// Cambiar rol de un usuario (para AdminPanel)
const updateUserRol = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  const rolesValidos = ['admin', 'usuario', 'encargado'];
  if (!rolesValidos.includes(rol)) {
    return res.status(400).json({ message: 'Rol inválido' });
  }

  try {
    await userModel.updateUserRol(id, rol);
    res.json({ message: 'Rol actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar el rol' });
  }
};

module.exports = {
  register,
  login,
  getAllUsers,
  updateUserRol
};
