const { RekognitionClient, DetectFacesCommand } = require('@aws-sdk/client-rekognition');
const fs = require('fs');
const sizeOf = require('image-size');
require('dotenv').config();

// Configura tus credenciales y región
const client = new RekognitionClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Función para analizar emociones
module.exports = {
  detectEmotions: async (imagePath) => {
    // Lee la imagen como un Buffer
    const imageBuffer = fs.readFileSync(imagePath);

    // Verifica si la imagen tiene un formato válido (usando image-size)
    const dimensions = sizeOf(imageBuffer);
    if (!dimensions || (dimensions.type !== 'jpg' && dimensions.type !== 'png')) {
      console.error('Error: El archivo no es una imagen válida JPEG o PNG.');
      return;
    }

    // Parámetros para el análisis de la cara
    const params = {
      Image: {
        Bytes: imageBuffer, // Pasa la imagen como bytes
      },
      Attributes: ['ALL'], // Incluye todas las características faciales
    };

    try {
      // Ejecuta el comando para detectar emociones en la cara
      const command = new DetectFacesCommand(params);
      const response = await client.send(command);

      // Muestra las emociones detectadas para la primera cara
      const faces = response.FaceDetails;
      faces.forEach((face, index) => {
        console.log(`Cara ${index + 1}:`);
        face.Emotions.forEach((emotion) => {
          console.log(`- ${emotion.Type}: ${emotion.Confidence.toFixed(2)}%`);
        });
      });
    } catch (error) {
      console.error('Error detectando emociones:', error);
    }
  },
}
// Llama a la función pasando el camino de la imagen
