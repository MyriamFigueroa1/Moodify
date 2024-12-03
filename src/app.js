const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const conn = require('./db/conn');
conn.connectToDatabase();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const facialRRouter = require('./routes/facialR');
const dashboardRouter = require('./routes/dashboard');
const dashboardAdminRouter = require('./routes/dashboardAdmin');
const perfilRouter = require('./routes/perfil');
const loginRegistrationRouter = require('./routes/login_registration');

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
app.use(express.static(path.join(__dirname, 'src', 'public')));

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
    maxAge: 1000 * 60 * 60 * 24 // 1 día
  }
}));

// Registrar el estado de la sesión
app.use((req, res, next) => {
  console.log('Estado de la sesión actual en cada solicitud:', req.session);
  next();
});

app.use((req, res, next) => {
  const mensaje = req.session.mensaje;
  const emotion = req.session.emotion;
  const canciones = req.session.canciones;
  res.locals.emotion = emotion || '';
  res.locals.canciones = canciones || '';
  res.locals.mensaje = mensaje || '';
  next();
});

// Verificar autenticación --- fallaba, borrar???
function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    console.log('Usuario autenticado:', req.session.user);
    return next();
  }
  console.log('Usuario no autenticado. Redirigiendo...');
  res.redirect('/');
}

// Ruta para cerrar sesión (un poco a la fuerza)
app.get('/logout', async (req, res) => {
  const db = require('./db/conn').getDb();
  delete req.session.emotion;
  delete req.session.canciones;
  delete res.locals.canciones;
  delete res.locals.emotion
  try {
    const sessionID = req.sessionID;;

    req.session.destroy(async (err) => {
      if (err) {
        return res.redirect('/dashboard');
      }

      await db.collection('sessions').deleteOne({ _id: sessionID });
      res.clearCookie('connect.sid', { path: '/' });
      res.redirect('/');
    });
  } catch (error) {
    console.error('Error al limpiar la sesión:', error);
    res.redirect('/');
  }
});

// Rutas
app.use('/', indexRouter);
app.use('/users', checkLogin, usersRouter);
app.use('/facialR', checkLogin, facialRRouter);
app.use('/perfil', checkLogin, perfilRouter);
app.use('/dashboard', checkLogin, dashboardRouter);
app.use('/dashboardAdmin', checkLogin, dashboardAdminRouter);
app.use('/login_registration', loginRegistrationRouter);

//Comprobar si el usuario ha iniciado sesión
function checkLogin(req, res, next){
  if(req.session.user){
    next();
  } else {
    res.redirect('login_registration');
  }
}

// Manejo de errores
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;