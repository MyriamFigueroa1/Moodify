document.addEventListener("DOMContentLoaded", function() {
    const fileInput = document.getElementById("fileInput");
    const preview = document.getElementById("preview");
    const uploadButton = document.getElementById("uploadButton");
  

    uploadButton.addEventListener("click", function() {
        fileInput.click(); // Simula el clic en el input de archivo
    });

    fileInput.addEventListener("change", function(event) {
        const file = event.target.files[0]; // Obtiene el archivo seleccionado
        if (file) {
            const reader = new FileReader(); // Crea un nuevo FileReader
            reader.onload = function(e) {
                preview.src = e.target.result; // Asigna la imagen seleccionada al src del <img>
            }
            reader.readAsDataURL(file); // Lee el archivo como URL de datos
        }
    });
    
});
function submitName() {
    const nameInput = document.getElementById('user-name');
    const nameDisplay = document.getElementById('name-display');

    // Mostrar el nombre introducido y ocultar el campo de entrada y el botón
    nameDisplay.innerText = nameInput.value;
    nameDisplay.style.display = 'block';
    nameInput.style.display = 'none';
    document.querySelector('.submit-btn').style.display = 'none';
  }


  document.addEventListener("DOMContentLoaded", function() {
    const buttonGuardar = document.getElementById("buttonguardar");
    
    if (buttonGuardar) {
        buttonGuardar.addEventListener("click", function(event) {
            event.preventDefault();
            
            // Captura los valores de los campos
            const nombre = document.getElementById("nombre").value;
            const apellido = document.getElementById("apellido").value;
            const email = document.getElementById("email").value;
            const telefono = document.getElementById("telefono").value;
            const emocion = document.getElementById("emotion").value;

            // Verifica los valores en la consola
            console.log("Nombre:", nombre);
            console.log("Apellido:", apellido);
            console.log("Correo Electrónico:", email);
            console.log("Teléfono:", telefono);
            console.log("Emociones:", emocion);
            document.getElementById("resultado").innerHTML = "";

            // Muestra los valores en el div de resultado
            document.getElementById("resultado").innerHTML = `
                <h3>Información Guardada</h3>
                <p><strong>Nombre:</strong> ${nombre}</p>
                <p><strong>Apellido:</strong> ${apellido}</p>
                <p><strong>Correo Electrónico:</strong> ${email}</p>
                <p><strong>Teléfono:</strong> ${telefono}</p>
                <p><strong>Emociones:</strong> ${emocion}</p>
            `;
            alert("Información guardada correctamente.");
        });
    }
});
 
