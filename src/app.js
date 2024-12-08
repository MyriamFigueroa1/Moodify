const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
require('dotenv').config();
const { connectToDatabase, getDb } = require('./db/conn'); // Importar conexión y función para obtener la base de datos

const conn = require('./db/conn');
conn.connectToDatabase();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const facialRRouter = require('./routes/facialR');
const dashboardRouter = require('./routes/dashboard');
const dashboardAdminRouter = require('./routes/dashboardAdmin');
const perfilRouter = require('./routes/perfil');
const loginRegistrationRouter = require('./routes/login_registration');
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
app.use((req, res, next) => {
  res.locals.user = req.session.user || null; // Hace que `user` esté disponible en todas las vistas
  next();
});

// Registrar el estado de la sesión
app.use((req, res, next) => {
  console.log('Estado de la sesión actual en cada solicitud:', req.session);
  next();
});

app.use((req, res, next) => {
  res.locals.messageType = req.session.messageType || null;
  res.locals.mensaje = req.session.mensaje || null;
  res.locals.emotion = req.session.emotion || '';
  res.locals.canciones = req.session.canciones || [];
  delete req.session.mensaje;
  delete req.session.messageType;
  next();
});

// Verificar autenticación --- fallaba, borrar???
function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
      return next();
  }
  req.session.messageType = 'error';
  req.session.mensaje = 'Por favor, inicia sesión para continuar.';
  res.redirect('/');
}

//Comprobar si el usuario ha iniciado sesión
function checkLogin(req, res, next){
  if(req.session.user){
    next();
  } else {
    res.redirect('login_registration');
  }
}

// Comprobar si el usuario es admin
const ensureAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.tipo === "admin") {
    return next();
  }
  res.render('error'); // O redirigir a una página de acceso no autorizado
};


app.use(async (req, res, next) => {
  if (req.session && req.session.user) {
      const db = getDb();
      const user = await db.collection('usuarios').findOne({ email: req.session.user.email });

      if (user) {
          res.locals.perfilImagen = user.perfilImagen || '/images/default-profile.jpg';
      } else {
          res.locals.perfilImagen = '/images/default-profile.jpg';
      }
  } else {
      res.locals.perfilImagen = '/images/default-profile.jpg';
  }
  next();
});


// Ruta para cerrar sesión (un poco a la fuerza)
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


// Rutas
app.use('/', indexRouter);
app.use('/users', checkLogin, usersRouter);
app.use('/facialR', checkLogin, facialRRouter);
app.use('/perfil', checkLogin, perfilRouter);
app.use('/dashboard', checkLogin, dashboardRouter);
app.use('/dashboardAdmin', dashboardAdminRouter);
app.use('/login_registration', loginRegistrationRouter);

app.use((req, res, next) => {
  console.log('Contenido de req.session.user:', req.session.user); // Verificar qué se está pasando
  res.locals.user = req.session.user || null;
  next();
});


// Manejo de errores
app.use(function (req, res, next) {
  next(createError(404));
});


app.use(cors())

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;