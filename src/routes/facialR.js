const express = require('express');
const router = express.Router();
const { getDb } = require('../db/conn');
const ObjectId = require('mongodb').ObjectId;
const multer = require('multer');
const path = require('path');
const os = require('os');
const fs = require('fs');
const faceRecognizer = require('../faceRecognizer/faceRecognition');
const chatGPT = require('../openai/openai');

let emotion = ""; 
let musicList = [];
const ensureAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
      return next();
  } else {
      return res.redirect('/login_registration');
  }
};

router.get('/', ensureAuthenticated, async (req, res) => {
  try {
        const db = getDb();
        const user = await db.collection('usuarios').findOne({ email: req.session.user.email });

        if (!user) {
            req.session.destroy(() => res.redirect('/login_registration'));
            return;
        }
        const perfilImagen = user.perfilImagen
            ? `data:image/jpeg;base64,${user.perfilImagen.toString('base64')}`
            : '/images/default-profile.jpg'; // Imagen predeterminada
        // Convertir la imagen binaria a base64 si existe
        res.render('facialR', {
            nombre: user.nombre,
            apellido: user.apellidos,
            email: user.email,
            perfilImagen
        });
    } catch (err) {
        console.error('Error al cargar facialR:', err);
        res.status(500).send('Error al cargar facialR.');
    }
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/procesar-imagen', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha recibido ninguna imagen.' });
    }
    
    // Guardar la imagen temporalmente
    const tempPath = path.join(os.tmpdir(), `temp-image-${Date.now()}.jpg`);
    fs.writeFileSync(tempPath, req.file.buffer);

    // Procesar la imagen con la ruta temporal
    const emotionsResult = await faceRecognizer.detectEmotions(tempPath);

    // Eliminar el archivo temporal
    fs.unlinkSync(tempPath);

    const emotionsToExclude = ['CALM']; // Lista de emociones a excluir

    // Procesar resultados de emociones
    for (const face of emotionsResult) {
      // Filtra las emociones que no deseas considerar
      const filteredEmotions = face.Emotions.filter(
        (emotion) => !emotionsToExclude.includes(emotion.Type)
      );

      // Encuentra la emoción con mayor confianza
      if (filteredEmotions.length > 0) {
        const maxEmotion = filteredEmotions.reduce((max, emotion) =>
          emotion.Confidence > max.Confidence ? emotion : max
        );
        emotion = maxEmotion.Type;
        break; 
      }
    }
    const prompt = `Genera una lista de 5 canciones ramdon diferente a esta lista ${musicList} que se adapten mejor a esta emocion ${emotion}, solo la lista no mas mensajes y que sea en formato json con un array strings llamado canciones y dentro las canciones. Solo la estructura json, que no incluya la palabra json`;
    const canciones = await chatGPT.chatGPT(prompt);
    musicList.splice(0, musicList.length);
    for (let i = 0; i < 5; i++){ 
      musicList.push(canciones.canciones[i]);
      console.log(canciones.canciones[i]);
    };

    const io = req.app.get('io');
    io.emit('notification', { message: 'Hola desde la route', emotion: emotion, canciones: musicList }); 

  } catch (error) {
    console.error('Error al procesar la imagen:', error);
    res.status(500).json({ message: 'Error al procesar la imagen.' });
  }
});

router.post('/publicar_canciones', async (req, res) => {
  console.log('bug 2');
  try {
      const user = req.session.user;
      const db = getDb();
      const userDb = await db.collection('usuarios').findOne({ email: req.session.user.email });
      const newPost = {
          userID: user.email,
          userName: `${user.nombre} - Feeling ${emotion}`,
          content: `🎵 Playlist Mood: ${musicList}`,
          postImage: userDb.perfilImagen,
          timestamp: new Date(),
      };
      console.log('bug 3');
      const dbConnect = getDb();
      await dbConnect.collection('posts').insertOne(newPost);
      console.log('bug 4');
      req.session.messageType = 'success';
      req.session.mensaje = '¡Tu playlist se ha publicado!';
      res.json({ mensaje: 'Tu playlist ha sido publicada!', messageType: 'success' });
      console.log('bug 5');
      console.log('bug 6');
  } catch (error) {
      console.error('Error al publicar canciones:', error);
      res.status(500).send('Error al publicar canciones');
  }
});

module.exports = router;