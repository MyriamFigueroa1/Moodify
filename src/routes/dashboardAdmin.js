var express = require('express');
var router = express.Router();
const { getDb } = require('../db/conn');
const { ObjectId } = require('mongodb');

// Middleware para asegurar que el usuario sea admin
const ensureAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.tipo === "admin") {
    return next();
  }
  res.render('error', { message: 'Acceso no autorizado' }); // O redirigir a página de acceso denegado
};

// Aplicar el middleware a todas las rutas de este router
router.use(ensureAdmin);

// Ruta GET para cargar el dashboardAdmin
router.get('/', async function(req, res, next) {
  try {
    const db = getDb();
    const posts = await db.collection('posts').find().sort({ timestamp: -1 }).toArray(); // Ordenar los posts por timestamp
    const userDb = await db.collection('usuarios').findOne({ email: req.session.user.email });

    const perfilImagen = userDb.perfilImagen
            ? `data:image/jpeg;base64,${userDb.perfilImagen.toString('base64')}`
            : '/images/default-profile.jpg'; // Imagen predeterminada

    const postsWithImages = posts.map(post => ({
      ...post,
      postImage: post.postImage
        ? `data:image/jpeg;base64,${post.postImage.toString('base64')}`
        : '/images/default-profile.jpg',
    }));
    res.render('dashboardAdmin', { title: 'Moodify', user: req.session.user, posts: postsWithImages, perfilImagen });
  } catch (error) {
    console.error('Error al obtener los posts:', error);
    res.render('error', { message: 'No se pudieron cargar los posts.' }); // Mostrar un mensaje de error si no se pueden obtener los posts
  }
});

// Ruta DELETE para borrar un post
router.delete('/delete', async function(req, res) {
  try {
    const { id } = req.body;

    // Validación del ID
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).send({ message: 'ID de post no válido' });
    }

    const postId = new ObjectId(id);
    const db = getDb();
    const response = await db.collection('posts').deleteOne({ _id: postId });

    if (response.deletedCount === 0) {
      return res.status(404).send({ message: 'Post no encontrado' });
    }

    return res.status(200).send({ message: 'Post eliminado exitosamente' });
  } catch (error) {
    console.error('Error al borrar un post:', error);
    res.status(500).send({ message: 'Error al eliminar el post' });
  }
});

module.exports = router;
