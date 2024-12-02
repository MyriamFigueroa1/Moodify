const express = require('express');
const router = express.Router();
const { getDb } = require('../db/conn');
const multer = require('multer');
const path = require('path');

// Configurar almacenamiento para multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads'); // Directorio donde se guardarán las imágenes
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname); // Obtener la extensión del archivo
        cb(null, Date.now() + ext); // Usar la fecha como nombre de archivo para evitar colisiones
    }
});

const upload = multer({ storage: storage });

// Verificar autenticación
const ensureAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.redirect('/login_registration');
  }
};

// Página de perfil
router.get('/', ensureAuthenticated, async (req, res, next) => {
  try {
    const db = getDb();
    const user = await db.collection('usuarios').findOne({ email: req.session.user.email });

    if (!user) {
      req.session.destroy(() => {
        return res.redirect('/login_registration');
      });
    }

    res.render('perfil', {
      nombre: user.nombre,
      apellido: user.apellidos,
      email: user.email,
      telefono: user.telefono || '',
    });
  } catch (err) {
    console.error('Error al cargar el perfil:', err);
    next(err);
  }
});

// Actualización del perfil
router.post('/update', ensureAuthenticated, async (req, res) => {
  try {
    const { nombre, apellidos, email, telefono } = req.body;
    const db = getDb();

    // Actualiza el usuario en la base de datos
    await db.collection('usuarios').updateOne(
      { email: req.session.user.email },
      { $set: { nombre, apellidos, email, telefono } }
    );

    // Actualiza la información de la sesión
    req.session.user = { email, nombre, apellidos };

    res.status(200).json({ message: 'Información actualizada correctamente.' });
  } catch (err) {
    console.error('Error al actualizar el perfil:', err);
    res.status(500).json({ message: 'Error al actualizar los datos.' });
  }
});

// Ruta para subir la imagen de perfil
router.post('/upload', ensureAuthenticated, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ninguna imagen.' });
    }

    const filename = req.file ? req.file.filename : null;
    if (!filename) {
      return res.status(400).json({ message: 'El archivo no es válido.' });
    }

    const db = getDb();
    await db.collection('usuarios').updateOne(
      { email: req.session.user.email },
      { $set: { perfilImagen: filename } }
    );

    // Puedes redirigir o enviar una respuesta exitosa
    res.redirect('/perfil');  // Redirige de vuelta al perfil con la imagen cargada
  } catch (err) {
    console.error('Error al subir la imagen:', err);
    res.status(500).json({ message: 'Error al subir la imagen.' });
  }
});


module.exports = router;
