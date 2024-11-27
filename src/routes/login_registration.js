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

// Registro de usuarios
router.post('/', async (req, res) => {
  const { nombre, apellidos, usuario, email, password } = req.body;

  if (!email || !password) {
    return res.render('login_registration', { 
      message: 'Email y contraseña son requeridos', 
      messageType: 'danger' 
    });
  }

  try {
    const db = getDb();
    const existingUser = await db.collection('usuarios').findOne({ email });
    if (existingUser) {
      return res.render('login_registration', { 
        message: 'El usuario ya está registrado', 
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
    res.render('login_registration', { 
      message: 'Usuario registrado exitosamente', 
      messageType: 'success' 
    });
  } catch (err) {
    console.error('Error al registrar el usuario:', err);
    res.render('login_registration', { 
      message: 'Ocurrió un error al registrar el usuario', 
      messageType: 'danger' 
    });
  }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
  console.log('POST /login alcanzado');
  const { email, password } = req.body;
  console.log('Datos recibidos:', email, password);

  console.log('Intentando iniciar sesión con:', email, password);

  if (!email || !password) {
    console.log('Email o contraseña no proporcionados');
    return res.render('login_registration', { 
      message: 'Email y contraseña son requeridos', 
      messageType: 'danger' 
    });
  }

  try {
    const db = getDb();

    // Busca al usuario en la base de datos
    const user = await db.collection('usuarios').findOne({ email });
    console.log('Usuario encontrado:', user);

    if (!user) {
      console.log('Usuario no encontrado');
      return res.render('login_registration', { 
        message: 'Usuario o contraseña incorrectos', 
        messageType: 'danger' 
      });
    }

    // Verifica la contraseña
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    console.log('¿Contraseña válida?', isPasswordCorrect);

    if (!isPasswordCorrect) {
      console.log('Contraseña incorrecta');
      return res.render('login_registration', { 
        message: 'Usuario o contraseña incorrectos', 
        messageType: 'danger' 
      });
    }

    // Regenerar la sesión
    req.session.regenerate((err) => {
      if (err) {
        console.error('Error al regenerar la sesión:', err);
        return res.render('login_registration', {
          message: 'Error al iniciar sesión',
          messageType: 'danger'
        });
      }

      // Asignar datos del usuario a la sesión
      req.session.user = {
        email: user.email,
        nombre: user.nombre,
        apellidos: user.apellidos
      };

      // Guardar la sesión
      req.session.save((err) => {
        if (err) {
          console.error('Error al guardar la sesión:', err);
          return res.render('login_registration', {
            message: 'Error al iniciar sesión',
            messageType: 'danger'
          });
        }

        console.log('Sesión guardada correctamente:', req.session.user);
        return res.redirect('/dashboard');
      });
    });
  } catch (err) {
    console.error('Error durante el inicio de sesión:', err);
    return res.render('login_registration', { 
      message: 'Ocurrió un error inesperado', 
      messageType: 'danger' 
    });
  }
});

module.exports = router;
