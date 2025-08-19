const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const publicacionController = require('../controllers/publicacionController');

// --- Asegurar carpeta 'uploads' ---
const uploadsPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// --- Configuración de Multer para manejo de archivos ---
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsPath);  // Configura la carpeta donde se guardarán las imágenes
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));  // Utiliza la extensión del archivo original
  }
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    // Eliminamos la validación de extensiones, aceptamos cualquier archivo
    cb(null, true);  // Aceptar cualquier tipo de archivo
  }
});

// --- Wrapper para manejar errores async ---
function wrapAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// --- Validación de parámetro :id ---
router.param('id', (req, res, next, id) => {
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ message: 'ID de publicación inválido' });
  }
  next();
});

// --- Rutas ---

// Crear publicación (hasta 10 imágenes)
router.post(
  '/',
  upload.array('imagenes', 10),  // Hasta 10 imágenes
  wrapAsync(publicacionController.crear)
);

// Listar todas las publicaciones (incluye datos de usuario)
router.get(
  '/',
  wrapAsync(publicacionController.listar)
);

// Eliminar publicación por ID
router.delete(
  '/:id',
  wrapAsync(publicacionController.eliminar)
);

// Actualizar publicación (puede incluir nuevas imágenes)
router.put(
  '/:id',
  upload.array('imagenes', 10),  // Subir hasta 10 imágenes (si es necesario)
  wrapAsync(publicacionController.actualizar)
);

module.exports = router;
