document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const captureButton = document.getElementById('capture');
  const feliz = document.getElementById('feliz');
  const musicList = document.getElementById('list-content');
  const spinner1 = document.getElementById('spinner1');
  const spinner2 = document.getElementById('spinner2');
  const spinner3 = document.getElementById('spinner3');
  const botonPublicar = document.getElementById('botonPublicarCanciones');
  const messageContainer = document.getElementById('mensaje');

  // Acceso a la cámara
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((error) => {
    console.error("Error al acceder a la cámara:", error);
  });
  function showMessage(message, type) {
    messageContainer.textContent = message; // Asigna el mensaje
    messageContainer.className = `alert alert-${type}`; // Aplica la clase CSS para el tipo de mensaje
    messageContainer.style.display = 'block'; // Asegúrate de que sea visible
    setTimeout(() => {
        messageContainer.style.display = 'none'; // Oculta el mensaje después de 3 segundos
    }, 3000);
  };
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

  botonPublicar.addEventListener('click', async () => {
    try {
        const response = await fetch('/facialR/publicar_canciones', { method: 'POST' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        console.log(result.mensaje + result.messageType);
        showMessage(result.mensaje, result.messageType);
        console.log('debug 0');
        //showMessage(result.mensaje, result.messageType || 'Tu playlist ha sido publicada!', 'success');
    } catch (error) {
        console.error('Error en la solicitud de publicación:', error.message);
        showMessage(error.message || 'Error inesperado.', 'danger');
    }
  });
});