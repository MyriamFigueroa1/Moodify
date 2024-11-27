const express = require('express');
const router = express.Router();
const { getDb } = require('../db/conn');

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

module.exports = router;
