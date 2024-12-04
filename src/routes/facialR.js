const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');
const ObjectId = require('mongodb').ObjectId;
const multer = require('multer');
const path = require('path');
const os = require('os');
const fs = require('fs');
const faceRecognizer = require('../faceRecognizer/faceRecognition');
const chatGPT = require('../openai/openai');

router.get('/', async (req, res) => {
  //const dbConnect = dbo.getDb();  // Conexión a la base de datos
  try {
    //let results = await dbConnect.collection('usuarios').findOne();  // Buscar un documento
    //console.log(results);  // Mostrar resultados en la consola
    res.render('facialR');  // Renderizar la vista 'facialR'
  } catch (err) {
    res.status(400).json({ error: 'Error al buscar álbumes' });
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
    let emotion = 'No detectada'; // Valor predeterminado si no hay emociones válidas

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
        req.session.emotion = maxEmotion.Type;
        console.log(req.session.emotion);
        break; // Solo necesitamos la emoción más relevante de la primera cara
      }
    }
    const prompt = `Genera una lista de 5 canciones ramdon que se adapten mejor a esta emocion ${req.session.emotion}, solo la lista no mas mensajes y que sea en formato json con un array strings llamado canciones y dentro las canciones. Solo la estructura json, que no incluya la palabra json`;
    const canciones = await chatGPT.chatGPT(prompt);
    musicList = [];
    for (let i = 0; i < 5; i++){ 
      musicList.push(canciones.canciones[i]);
      console.log(canciones.canciones[i]);
    };
    req.session.canciones = musicList;
    res.render('facialR', { emotion: req.session.emotion, canciones: req.session.canciones });
    delete req.session.emotion;
    delete req.session.canciones; 
  } catch (error) {
    console.error('Error al procesar la imagen:', error);
    res.status(500).json({ message: 'Error al procesar la imagen.' });
  }
});

router.post('/publicar_canciones', async (req, res) => {
  console.log('bug 2');
  try {
      const user = req.session.user;
      const newPost = {
          userID: user.email,
          userName: `${user.nombre} - Feeling ${req.session.emotion}`,
          content: `🎵 Playlist Mood: ${req.session.canciones}`,
          timestamp: new Date(),
      };
      console.log('bug 3');
      const dbConnect = dbo.getDb();
      console.log('Post a insertar:', newPost);
      await dbConnect.collection('posts').insertOne(newPost);
      console.log('bug 4');
      req.session.messageType = 'success';
      req.session.mensaje = '¡Tu playlist se ha publicado!';
      res.json({ message: 'Tu playlist ha sido publicada!', messageType: 'success' });
      console.log('bug 5');
      // Limpia el mensaje después de enviarlo
      delete req.session.mensaje;
      console.log('bug 6');
  } catch (error) {
      console.error('Error al publicar canciones:', error);
      res.status(500).send('Error al publicar canciones');
  }
});


module.exports = router;