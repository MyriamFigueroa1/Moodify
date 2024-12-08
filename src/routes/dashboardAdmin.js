var express = require('express');
var router = express.Router();
const { getDb } = require('../db/conn');
const {ObjectId} = require('mongodb')

/* GET home page. */
router.get('/', async function(req, res, next) {
  if(req.session.user == undefined ||req.session.user.tipo == undefined || req.session.user.tipo != "admin"){
    res.render("error")
  }
  try {
    const db = getDb();
    const posts = await db.collection('posts').find().sort({ timestamp: -1 }).toArray();
    console.log(posts)
    res.render('dashboardAdmin', { title: 'Express', user: req.session.user, posts:posts});
  } catch (error) {
    console.error('Error al obtener los posts:', error);
  }
});

router.delete('/delete' , async function(req,res) {
  try {
    console.log(req.body.id)
    const postId = new ObjectId(req.body.id)
    const db = getDb();
    const response =await db.collection('posts').deleteOne({ _id: postId });
    console.log(response)
    res.redirect('/dashboardAdmin');
  } catch(error){
    console.error('Error al borrar un post:', error);
  }
});

module.exports = router;
