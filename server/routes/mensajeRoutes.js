const express = require('express');
const router = express.Router();
const mensajeController = require('../controllers/mensajeController');

// Ruta para crear un mensaje
router.post('/', mensajeController.crear);  // Llama directamente al controlador

// Ruta para listar todos los mensajes
router.get('/', mensajeController.listar);  // Llama directamente al controlador

module.exports = router;
