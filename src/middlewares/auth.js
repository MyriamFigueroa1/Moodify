function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user && req.session.user._id) {
    return next();
  }
  req.session.messageType = 'error';
  req.session.mensaje = 'Por favor, inicia sesión para continuar.';
  res.redirect('/');
}

function checkLogin(req, res, next) {
  if (req.session.user && req.session.user._id) {
    return next();
  }
  res.redirect('/login_registration');
}

  
  const ensureAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.tipo === "admin") {
      return next();
    }
    res.render('error'); // O redirigir a una página de acceso no autorizado
  };
  
  module.exports = { ensureAuthenticated, checkLogin, ensureAdmin };
  