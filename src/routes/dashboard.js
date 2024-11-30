const express = require('express');
const router = express.Router();
const { getDb } = require('../db/conn');


// Ruta para renderizar el dashboard
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const posts = await db.collection('posts').find().sort({ timestamp: -1 }).toArray();

    res.render('dashboard', {
      user: req.session.user,
      posts: posts
    });
  } catch (error) {
    console.error('Error al obtener los posts:', error);
    res.status(500).send('Error al obtener los posts');
  }
});

// Ruta para agregar un nuevo post
router.post('/add', async (req, res) => {
  try {
    const db = getDb();

    const newPost = {
      userID: req.session.user._id,
      userName: req.session.user.name,
      content: req.body.content,
      timestamp: new Date()
    };

    await db.collection('posts').insertOne(newPost); // Insertar el post en la base de datos
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error al agregar un nuevo post:', error);
    res.status(500).send('Error al agregar un nuevo post');
  }
});

module.exports = router;
