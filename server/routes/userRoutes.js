const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Registro de usuario
router.post('/register', userController.register);

// Login de usuario
router.post('/login', userController.login);

// Obtener todos los usuarios (para AdminPanel)
router.get('/usuarios', userController.getAllUsers);

// Cambiar el rol de un usuario (para AdminPanel)
router.put('/usuarios/:id/rol', userController.updateUserRol);

module.exports = router;
