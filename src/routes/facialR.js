const express = require('express');
const multer = require('multer');
const path = require('path');
const os = require('os')
const fs = require('fs');
const router = express.Router();
const dbo = require('../db/conn'); // Conexión a la base de datos
const ObjectId = require('mongodb').ObjectId;
const faceRecognizer = require('../faceRecognizer/faceRecognition'); // Reconocimiento facial

// Ruta GET para renderizar la vista o realizar alguna consulta
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

    // Renderizar la vista con la emoción detectada
    res.render('facialR', { emotion: req.session.emotion });
  } catch (error) {
    console.error('Error al procesar la imagen:', error);
    res.status(500).json({ message: 'Error al procesar la imagen.' });
  }
});

module.exports = router;
