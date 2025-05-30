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

// Función para validar la contraseña
function validarContrasena(password) {
  const requisitos = [
    { regex: /.{8,}/, mensaje: "Debe tener al menos 8 caracteres." },
    { regex: /[A-Z]/, mensaje: "Debe incluir al menos una letra mayúscula." },
    { regex: /[a-z]/, mensaje: "Debe incluir al menos una letra minúscula." },
    { regex: /[0-9]/, mensaje: "Debe incluir al menos un número." },
    { regex: /[^A-Za-z0-9]/, mensaje: "Debe incluir al menos un carácter especial." }
  ];

  const errores = requisitos.filter(r => !r.regex.test(password)).map(r => r.mensaje);
  return errores;
}

// Manejo de registro
router.post('/', async (req, res) => {
  const { email, password, confirmPassword, nombre, apellidos, usuario } = req.body;

  if (!email || !password) {
    return res.render('login_registration', {
      message: 'Por favor, completa todos los campos.',
      messageType: 'danger'
    });
  }

  if (nombre && apellidos && usuario) {
    // Validación de contraseñas
    if (password !== confirmPassword) {
      return res.render('login_registration', { 
        message: 'Las contraseñas no coinciden.',
        messageType: 'danger'
      });
    }

    // Validar requisitos de contraseña
    const erroresContrasena = validarContrasena(password);
    if (erroresContrasena.length > 0) {
      return res.render('login_registration', {
        message: `Error en la contraseña: ${erroresContrasena.join(' ')}`,
        messageType: 'danger'
      });
    }

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
        createdAt: new Date(),
        tipo: email === "admin@gmail.com" ? "admin" : "user"
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
    // Crear la sesión del usuario
    req.session.regenerate((err) => {
      if (err) {
        return res.render('login_registration', {
          message: 'Error al iniciar sesión.',
          messageType: 'danger'
        });
      }

      req.session.user = {
        _id: user._id.toString(), // Aquí agregamos el _id del usuario a la sesión
        email: user.email,
        nombre: user.nombre,
        apellidos: user.apellidos,
        tipo: user.tipo // Guardamos el tipo en la sesión también
      };

      req.session.save((err) => {
        if (err) {
          return res.render('login_registration', {
            message: 'Error al iniciar sesión.',
            messageType: 'danger'
          });
        }

        if (user.tipo === "admin") {
          return res.redirect('/dashboardAdmin'); // Redirigir al dashboard del admin
        } else {
          return res.redirect('/dashboard'); // Redirigir al dashboard del usuario
        }
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
