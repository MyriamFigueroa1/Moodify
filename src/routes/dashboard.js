const express = require('express');
const router = express.Router();
const { getDb, ObjectId } = require('../db/conn');

// Ruta para renderizar el dashboard
router.get('/', async (req, res) => {
  try {
    const db = getDb();

    // Obtener las publicaciones
    const posts = await db.collection('posts').find().sort({ timestamp: -1 }).toArray();

    // Enriquecer las publicaciones con la información del usuario
    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        try {
          if (!post.userID || typeof post.userID !== 'string' || post.userID.length !== 24 || !/^[a-fA-F0-9]{24}$/.test(post.userID)) {
            console.warn(`Post con ID ${post._id} tiene un userID inválido o nulo.`);
            return { ...post }; // Devuelve el post sin modificar si el userID no es válido
          }
    
          const user = await db.collection('usuarios').findOne({ _id: new ObjectId(post.userID) });
    
          // Verifica si el usuario tiene una foto de perfil, si no la tiene, usa la predeterminada
          const profilePicture = user?.profilePicture
            ? `data:image/jpeg;base64,${user.profilePicture.toString('base64')}`
            : post.profilePicture;
    
          return {
            ...post,
            profilePicture, // Agrega la imagen del usuario o la predeterminada
          };
        } catch (err) {
          console.error(`Error al enriquecer el post con ID ${post._id}:`, err.message);
          return { ...post }; // Devuelve el post sin modificar si hay un error
        }
      })
    );    

    res.render('dashboard', {
      user: req.session.user,
      posts: enrichedPosts,
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

    // Verificar si el usuario está autenticado y tiene un _id
    if (!user || !user._id) {
      return res.status(400).send('Usuario no autenticado o datos incompletos.');
    }

    const newPost = {
      userID: user._id, // Asociar el post al _id del usuario
      userName: user.nombre || 'Usuario', // Asegurar que el nombre del usuario esté presente
      userSurname: user.apellidos || '',
      content: req.body.content,
      profilePicture: '/images/default-profile.jpg', // Imagen predeterminada si no hay imagen
      timestamp: new Date(), // Timestamp actual
    };

    // Insertar el nuevo post en la colección 'posts'
    await db.collection('posts').insertOne(newPost);
    res.redirect('/dashboard'); // Redirigir a la página del dashboard

  } catch (error) {
    console.error('Error al agregar un nuevo post:', error);
    res.status(500).send('Error al agregar un nuevo post');
  }
});



module.exports = router;
