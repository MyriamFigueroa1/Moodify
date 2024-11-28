const express = require('express');
const router = express.Router();
const { getDb } = require('../db/conn');


router.get('/', async (req, res) => {
  try{
    const db = getDb();
    const posts = await db.collection('posts').find().toArray();
    console.log(posts);
    
    res.render('dashboard', {
      user: req.session.user,
      posts: posts
    });
  } catch (error){
    console.error('Error al obtener los posts:', error);
    res.status(500).send('Error al obtener los posts');
  }
});

router.post('/createpost', async (req, res)=> {
  const {emoji, songs} = req.body;
  const userId = req.session.user._id;

  try{
    const db = getDb();
    const newPost = {
      userId,
      userName: req.session.user.userName,
      emoji,
      content: songs
    };

    await db.collection('posts').insertOne(newPost);

    res.json({ success: true });
  } catch (error){
    console.error('Error al guardar la publicación:', error);
    res.status(500).json({ success: false, error: 'Error al guardar la publicación' });
  }
});

module.exports = router;
