const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');
const ObjectId = require('mongodb').ObjectId;

router.get('/', async (req, res) => {

  const dbConnect = dbo.getDb();

  try {
        let results = await dbConnect
          .collection('usuarios')
          .findOne();

        console.log(results);
        res.render('facialR');
    } catch (err) {
      res.status(400).json({ error: 'Error al buscar álbumes' });
  }
});

module.exports = router;
