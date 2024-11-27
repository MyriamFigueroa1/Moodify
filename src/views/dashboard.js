const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('dashboard', { user: req.session.user });
});

module.exports = router;
