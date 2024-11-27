const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { getDb } = require('../db/conn');

// Página de registro e inicio de sesión
router.get('/', (req, res) => {
  res.render('login_registration', { 
    message: null, 
    messageType: null 
  });
});

// Manejo de registro o login
router.post('/', async (req, res) => {
  const { email, password, nombre, apellidos, usuario } = req.body;

  // Si el formulario incluye "nombre", asumimos que es registro
  if (nombre && apellidos && usuario) {
    try {
      const db = getDb();
      const existingUser = await db.collection('usuarios').findOne({ email });
      if (existingUser) {
        return res.render('login_registration', { 
          message: 'El usuario ya está registrado.', 
          messageType: 'danger' 
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        nombre,
        apellidos,
        usuario,
        email,
        password: hashedPassword,
        createdAt: new Date()
      };

      await db.collection('usuarios').insertOne(newUser);
      return res.render('login_registration', { 
        message: 'Usuario registrado exitosamente.', 
        messageType: 'success' 
      });
    } catch (err) {
      console.error('Error al registrar el usuario:', err);
      return res.render('login_registration', { 
        message: 'Error al registrar el usuario.', 
        messageType: 'danger' 
      });
    }
  }

  // Si no incluye "nombre", asumimos que es login
  try {
    const db = getDb();
    const user = await db.collection('usuarios').findOne({ email });

    if (!user) {
      return res.render('login_registration', { 
        message: 'Usuario o contraseña incorrectos.', 
        messageType: 'danger' 
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.render('login_registration', { 
        message: 'Usuario o contraseña incorrectos.', 
        messageType: 'danger' 
      });
    }

    // Crear la sesión del usuario
    req.session.regenerate((err) => {
      if (err) {
        return res.render('login_registration', {
          message: 'Error al iniciar sesión.',
          messageType: 'danger'
        });
      }

      req.session.user = {
        email: user.email,
        nombre: user.nombre,
        apellidos: user.apellidos
      };

      req.session.save((err) => {
        if (err) {
          return res.render('login_registration', {
            message: 'Error al iniciar sesión.',
            messageType: 'danger'
          });
        }

        return res.redirect('/dashboard'); // Redirigir al dashboard
      });
    });
  } catch (err) {
    console.error('Error durante el inicio de sesión:', err);
    return res.render('login_registration', { 
      message: 'Error inesperado.', 
      messageType: 'danger' 
    });
  }
});

module.exports = router;
