const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const feliz = document.getElementById('feliz');
const musicList = document.getElementById('list-content');
const spinner1 = document.getElementById('spinner1');
const spinner2 = document.getElementById('spinner2');
const spinner3 = document.getElementById('spinner3');

// Acceso a la cámara
navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
.then((stream) => {
  video.srcObject = stream;
})
.catch((error) => {
  console.error("Error al acceder a la cámara:", error);
});

// Captura la foto
captureButton.addEventListener('click', () => {
  console.log('hello');
  feliz.style.display = 'block';
  musicList.style.display = 'block';
  spinner1.style.display = 'block';
  spinner2.style.display = 'block';
  spinner3.style.display = 'block';

  const context = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Dibuja el contenido del video en el canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convierte el canvas a un Blob en formato JPEG
  canvas.toBlob((blob) => {
    const formData = new FormData();
    formData.append('image', blob, 'captura.jpg');  // Nombre del archivo

    // Envía la imagen al servidor sin guardarla en disco
    fetch('/facialR/procesar-imagen', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        console.log('Imagen procesada en el servidor:', data);
      })
      .catch(error => {
        console.error('Error al enviar la imagen:', error);
      });
  }, 'image/jpeg', 0.8);
  
  setTimeout(function() {
    location.reload(true);
  }, 4000);
  feliz.style.display = 'none';
});
