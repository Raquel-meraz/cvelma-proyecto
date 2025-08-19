const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const publicacionRoutes = require('./routes/publicacionRoutes');
const mensajeRoutes = require('./routes/mensajeRoutes');

const app = express();

// Habilitar CORS y parsers
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Asegurar que exista la carpeta 'uploads' y crearla si no existe
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Servir archivos estáticos de la carpeta 'uploads'
// Express se encarga de establecer el Content-Type automáticamente según el archivo
app.use('/uploads', express.static(uploadsPath));

// Rutas de usuario
app.use('/api', userRoutes);

// Rutas de publicaciones
app.use('/api/publicaciones', publicacionRoutes);

// Rutas de mensajes (contacto al encargado)
app.use('/api/mensajes', mensajeRoutes);

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  const status = err.status || 500;
  const message = err.message || 'Algo salió mal, por favor intente más tarde.';
  res.status(status).json({ message });
});

// Iniciar servidor en el puerto definido en .env o fallback a 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
