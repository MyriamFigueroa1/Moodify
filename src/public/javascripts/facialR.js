const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const photo = document.getElementById('photo');
const emotion =  document.getElementById('emotion')
const feliz = document.getElementById('feliz')
const musicList = document.getElementById('list-content')

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
feliz.style.display = 'block';
musicList.style.display = 'block';

const context = canvas.getContext('2d');
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
context.drawImage(video, 0, 0, canvas.width, canvas.height);

// Muestra la foto capturada
photo.src = canvas.toDataURL('image/png');
//photo.style.display = 'block';
});

