const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
require('dotenv').config();
const { connectToDatabase } = require('./db/conn');
const { ensureAuthenticated, checkLogin, ensureAdmin } = require('./middlewares/auth'); // Autenticación modularizada

// Conectar a la base de datos
connectToDatabase()
  .then(() => console.log('Conectado a la base de datos'))
  .catch(err => console.error('Error al conectar a la base de datos:', err));

const app = express();
const mongoUri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@moodify.g75fs.mongodb.net/?retryWrites=true&w=majority`;

// Configuración del motor de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares generales
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de la sesión
app.use(session({
  secret: 'mi_secreto', 
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: mongoUri,
    dbName: 'moodify',
    collectionName: 'sessions',
    ttl: 24 * 60 * 60,
    autoRemove: 'native'
  }),
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: null
  }
}));

// Middleware para manejar la sesión y configurar locals
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.messageType = req.session.messageType || null;
  res.locals.mensaje = req.session.mensaje || null;
  res.locals.perfilImagen = req.session.user ? req.session.user.perfilImagen || '/images/default-profile.jpg' 
  : '/images/default-profile.jpg';
  delete req.session.mensaje;
  delete req.session.messageType;
  next();
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          console.error('Error al cerrar sesión:', err);
          return res.redirect('/dashboard'); // O página de error
      }
      res.clearCookie('connect.sid');
      res.redirect('/');
  });
});

app.use(cors());

// Rutas
app.use('/', require('./routes/index'));
app.use('/users', checkLogin, require('./routes/users'));
app.use('/facialR', checkLogin, require('./routes/facialR'));
app.use('/perfil', checkLogin, require('./routes/perfil'));
app.use('/dashboard', checkLogin, require('./routes/dashboard'));
app.use('/dashboardAdmin', ensureAdmin, require('./routes/dashboardAdmin'));
app.use('/login_registration', require('./routes/login_registration'));

// Manejo de errores
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(async (req, res, next) => {
  if (req.session && req.session.user) {
      try {
          const db = getDb();
          const user = await db.collection('usuarios').findOne({ email: req.session.user.email });

          // Convertir imagen binaria a base64 si existe
          res.locals.perfilImagen = user?.perfilImagen
              ? `data:image/jpeg;base64,${user.perfilImagen.toString('base64')}`
              : '/images/default-profile.jpg'; // Imagen predeterminada
      } catch (err) {
          console.error('Error al cargar la imagen de perfil:', err);
          res.locals.perfilImagen = '/images/default-profile.jpg';
      }
  } else {
      res.locals.perfilImagen = '/images/default-profile.jpg';
  }
  next(); // Continuar con la siguiente función middleware o ruta
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
