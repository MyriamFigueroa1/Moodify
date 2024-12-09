const express = require('express');
const router = express.Router();
const { getDb } = require('../db/conn');


// Ruta para renderizar el dashboard
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const user = await db.collection('usuarios').findOne({ email: req.session.user.email });
    const posts = await db.collection('posts').find().sort({ timestamp: -1 }).toArray();

    const perfilImagen = user.perfilImagen
            ? `data:image/jpeg;base64,${user.perfilImagen.toString('base64')}`
            : '/images/default-profile.jpg'; // Imagen predeterminada
      const postsWithImages = posts.map(post => ({
        ...post,
        postImage: post.postImage
          ? `data:image/jpeg;base64,${post.postImage.toString('base64')}`
          : '/images/default-profile.jpg',
      }));
    // Obtener las publicaciones
    // Si hay un mensaje de éxito, pasarlo al renderizar el dashboard
    const successMessage = req.query.successMessage || null;

    res.render('dashboard', {
      user: req.session.user,
      posts: postsWithImages,
      perfilImagen,
      successMessage, // Pasar el mensaje de éxito para mostrarlo en la vista
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
    const { user } = req.session; // Obtener el usuario de la sesión
    const userDb = await db.collection('usuarios').findOne({ email: req.session.user.email });

    // Verificar si el usuario está autenticado y tiene un _id
    if (!user || !user._id) {
      return res.status(400).send('Usuario no autenticado o datos incompletos.');
    }

    const newPost = {
      userID: user.email, // Asociar el post al _id del usuario
      userName: user.nombre || 'Usuario', // Asegurar que el nombre del usuario esté presente
      userSurname: user.apellidos || '',
      content: req.body.content,
      postImage: userDb.perfilImagen,
      timestamp: new Date(), // Timestamp actual
    };

    // Insertar el nuevo post en la colección 'posts'
    await db.collection('posts').insertOne(newPost);

    // Redirigir al dashboard con un mensaje de éxito
    res.redirect('/dashboard?successMessage=Tu publicación se ha realizado correctamente.');
  } catch (error) {
    console.error('Error al agregar un nuevo post:', error);
    res.status(500).send('Error al agregar un nuevo post');
  }
});

module.exports = router;
