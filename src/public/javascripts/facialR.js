document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const captureButton = document.getElementById('capture');
  //const feliz = document.getElementById('feliz');
  const musicList = document.getElementById('list-content');
  const spinner = document.getElementById('spinner');
  const botonPublicar = document.getElementById('botonPublicarCanciones');
  const messageContainer = document.getElementById('mensaje');
  const sock = document.getElementById('sock');
  let serverData = ''; 

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

  socket.on('respuestaServidor', (data) => {
    console.log('Respuesta del servidor:', data);
  });
  socket.on('facialR', (msg) => {
    
    console.log("Mensaje recibido");
    const emotion = document.createElement('p');
    emotion.textContent = msg;
    sock.appendChild(emotion);
  });
  
  socket.on('notification', (data) => {
    sock.innerHTML = '';
    console.log('Desde la ruta:', data)

    const emotion = document.createElement('p');
    emotion.textContent = data.emotion;
    sock.appendChild(emotion);
    musicList.innerHTML = '';
    for (let i = 0; i < data.canciones.length; i++) {
      const song = document.createElement('li');
      song.textContent = data.canciones[i];
      musicList.appendChild(song);
    };
  });
  // Captura la foto
  function showSpinnerTemporarily(spinner, duration = 2000) {
    spinner.style.display = 'block';
    
    setTimeout(() => {
        spinner.style.display = 'none';
    }, duration);
  };

  captureButton.addEventListener('click', () => {
    console.log('hello');
    //feliz.style.display = 'block';
    musicList.style.display = 'block';

    showSpinnerTemporarily(spinner);
  
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

    socket.emit('mensajeCliente', { text: 'Hola servidor, soy el cliente' });
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

