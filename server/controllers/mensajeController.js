const mensajeModel = require('../models/mensajeModel');

// CREAR un mensaje
const crear = async (req, res) => {
  try {
    const { nombre, mensaje } = req.body;
    const id_usuario = req.user?.id || null;  // Obtenemos el id_usuario del token o dejamos null si no existe

    // Validar que los campos obligatorios estén presentes
    if (!nombre || !mensaje) {
      return res.status(400).json({ message: 'Nombre y mensaje son requeridos' });
    }

    // Verificar si id_usuario es opcional y si es válido
    if (id_usuario && isNaN(id_usuario)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    // Llamar al modelo para crear el mensaje
    await mensajeModel.crearMensaje({ nombre, mensaje, id_usuario });

    // Responder con éxito
    res.status(201).json({ message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('Error en crear mensaje:', error);
    res.status(500).json({ message: 'Error al enviar mensaje', error: error.message });
  }
};

// LISTAR todos los mensajes
const listar = async (req, res) => {
  try {
    const mensajes = await mensajeModel.obtenerMensajes();

    // Si no hay mensajes, devolver una lista vacía
    if (!mensajes || mensajes.length === 0) {
      return res.status(404).json({ message: 'No se encontraron mensajes' });
    }

    // Responder con los mensajes
    res.status(200).json(mensajes);
  } catch (error) {
    console.error('Error en listar mensajes:', error);
    res.status(500).json({ message: 'Error al obtener mensajes', error: error.message });
  }
};

module.exports = { crear, listar };
