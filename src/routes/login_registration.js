var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

const { getDb } = require('../db/conn');
router.get('/', function(req, res, next) {
  res.render('login_registration');
});

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  try {
      const db = getDb();
      const existingUser = await db.collection('users').findOne({ email });

      if (existingUser) {
          // Usuario ya registrado
          return res.status(409).json({ error: 'El usuario ya está registrado' });
      }

      // Crear nuevo usuario
      const newUser = {
          email,
          password: await bcrypt.hash(password, 10),
          createdAt: new Date(),
      };
      await db.collection('users').insertOne(newUser);

      // Respuesta exitosa
      res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});
module.exports = router;