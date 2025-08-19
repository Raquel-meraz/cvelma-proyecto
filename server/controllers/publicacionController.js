const publicacionModel = require('../models/publicacionModel');

// CREAR una nueva publicación
const crear = async (req, res) => {
  try {
    console.log('Archivos subidos:', req.files);
    console.log('Body crear:', req.body);

    // 1) Construir array de URLs de las imágenes subidas
    const archivos = req.files || [];
    const imagenes_url = archivos.map(file => `/uploads/${file.filename}`);

    // 2) Extraer y normalizar campos del body
    const {
      titulo = "",
      descripcion = "",
      talla = "",
      precio = "0",
      estado = "",
      ubicacion = "",
      contacto = "",
      entrega = "",
      usuario_id
    } = req.body;

    // 3) Validaciones básicas
    if (!titulo.trim()) {
      return res.status(400).json({ message: "El título es obligatorio" });
    }
    if (!usuario_id) {
      return res.status(400).json({ message: "Falta el id del usuario creador" });
    }
    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum < 0) {
      return res.status(400).json({ message: "El precio debe ser un número válido >= 0" });
    }

    // 4) Llamar al modelo
    await publicacionModel.crearPublicacion({
      titulo:       titulo.trim(),
      descripcion:  descripcion.trim(),
      talla:        talla.trim(),
      precio:       precioNum,
      estado:       estado.trim(),
      ubicacion:    ubicacion.trim(),
      contacto:     contacto.trim(),
      entrega:      entrega.trim(),
      imagenes_url,                         
      usuario_id:   parseInt(usuario_id, 10)
    });

    // 5) Responder éxito
    return res.status(201).json({ message: 'Publicación creada exitosamente' });
  } catch (error) {
    console.error("ERROR crearPublicacion:", error);
    return res.status(500).json({
      message: 'Error al crear publicación',
      error: error.message
    });
  }
};

// LISTAR todas las publicaciones con datos del usuario asociado
const listar = async (req, res) => {
  try {
    const publicaciones = await publicacionModel.obtenerPublicacionesConUsuario();
    return res.status(200).json(Array.isArray(publicaciones) ? publicaciones : []);
  } catch (error) {
    console.error("ERROR listarPublicaciones:", error);
    return res.status(500).json({
      message: 'Error al obtener publicaciones',
      error: error.message
    });
  }
};

// ELIMINAR publicación por ID
const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "ID de publicación requerido" });
    }

    // Verifica si la publicación existe antes de eliminarla
    const publicacion = await publicacionModel.obtenerPublicacionPorId(id);
    if (!publicacion) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    await publicacionModel.eliminarPublicacion(parseInt(id, 10));
    return res.status(200).json({ message: "Publicación eliminada exitosamente" });
  } catch (error) {
    console.error("ERROR eliminarPublicacion:", error);
    return res.status(500).json({
      message: "Error al eliminar publicación",
      error: error.message
    });
  }
};

// ACTUALIZAR publicación por ID
const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Archivos subidos al actualizar:', req.files);
    console.log('Body actualizar:', req.body);

    if (!id) {
      return res.status(400).json({ message: "ID de publicación requerido" });
    }

    // Verifica si la publicación existe antes de actualizarla
    const publicacionExistente = await publicacionModel.obtenerPublicacionPorId(id);
    if (!publicacionExistente) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    // 1) Construir array de URLs actualizado
    let imagenes_url = [];
    if (req.files && req.files.length > 0) {
      imagenes_url = req.files.map(f => `/uploads/${f.filename}`);
    } else if (req.body.imagenes_url) {
      imagenes_url = Array.isArray(req.body.imagenes_url)
        ? req.body.imagenes_url
        : JSON.parse(req.body.imagenes_url || '[]');
    }

    // 2) Extraer y normalizar campos
    const {
      titulo = "",
      descripcion = "",
      talla = "",
      precio = "0",
      estado = "",
      ubicacion = "",
      contacto = "",
      entrega = "",
      usuario_id
    } = req.body;

    // 3) Validaciones
    if (!titulo.trim()) {
      return res.status(400).json({ message: "El título es obligatorio" });
    }
    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum < 0) {
      return res.status(400).json({ message: "El precio debe ser un número válido >= 0" });
    }

    // 4) Llamar al modelo para actualizar la publicación
    await publicacionModel.actualizarPublicacion(
      parseInt(id, 10),
      {
        titulo:       titulo.trim(),
        descripcion:  descripcion.trim(),
        talla:        talla.trim(),
        precio:       precioNum,
        estado:       estado.trim(),
        ubicacion:    ubicacion.trim(),
        contacto:     contacto.trim(),
        entrega:      entrega.trim(),
        imagenes_url                       
      }
    );

    // 5) Responder éxito
    return res.status(200).json({ message: "Publicación actualizada exitosamente" });
  } catch (error) {
    console.error("ERROR actualizarPublicacion:", error);
    return res.status(500).json({
      message: "Error al actualizar publicación",
      error: error.message
    });
  }
};

module.exports = { crear, listar, eliminar, actualizar };
