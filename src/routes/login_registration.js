var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

const { getDb } = require('../db/conn');
router.get('/', (req, res) => {
    res.render('login_registration', { 
      message: null, 
      messageType: null 
    });
  });

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

    // Crear nuevo usuario
    const newUser = {
      nombre,
      apellidos,
      usuario,
      email,
      password: await bcrypt.hash(password, 10), // Encripta la contraseña
      createdAt: new Date(),
    };
    await db.collection('usuarios').insertOne(newUser);

    res.render('login_registration', { 
      message: 'Usuario registrado exitosamente', 
      messageType: 'success' 
    });
  } catch (err) {
    console.error(err);
    res.render('login_registration', { 
      message: 'Error al registrar el usuario', 
      messageType: 'danger' 
    });
  }
});

module.exports = router;