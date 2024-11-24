const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const conn = require('./db/conn');
const session = require('express-session')

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const facialRRouter = require('./routes/facialR');
const dashboardRouter = require('./routes/dashboard');
const perfilRouter = require('./routes/perfil');
const loginRegistrationRouter = require('./routes/login_registration');

conn.connectToDatabase();
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'mi_secreto',         // Secreto para firmar la cookie
  resave: false,                // No volver a guardar la sesión si no se modificó
  saveUninitialized: true,      // Guardar sesiones no inicializadas
  cookie: { secure: false }     // Cambiar a `true` en producción si usas HTTPS
}));
app.use((req,res,next) => {
  const emotion = req.session.emotion;
  delete req.session.emotion;
  res.locals.emotion = "";
  if(emotion){res.locals.emotion = emotion};
  next();
});
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/facialR', facialRRouter);
app.use('/dashboard', dashboardRouter);
app.use('/perfil', perfilRouter);
app.use('/login_registration', loginRegistrationRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use('/login_registration', (req, res, next) => {
  console.log('Ruta /login_registration alcanzada');
  next();
}, loginRegistrationRouter);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
