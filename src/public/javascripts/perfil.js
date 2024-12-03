document.addEventListener("DOMContentLoaded", function() {
    const userInfo = document.getElementById('userInfo');
    
    const userData = {
        nombre: userInfo.dataset.nombre,
        apellido: userInfo.dataset.apellido,
        email: userInfo.dataset.email,
    };

    // Mostrar los datos iniciales en el perfil
    for (let key in userData) {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = userData[key] || '';
        }
    }

    const editButton = document.getElementById('editButton');
    const editForm = document.getElementById('editForm');
    const cancelButton = document.getElementById('cancelButton');

    editButton.addEventListener('click', () => {
        document.getElementById('userInfo').style.display = 'none';
        editForm.style.display = 'block';

        // Prellenar el formulario con los datos existentes
        document.getElementById('editNombre').value = userData.nombre;
        document.getElementById('editApellido').value = userData.apellido;
        document.getElementById('editEmail').value = userData.email;
    });

    cancelButton.addEventListener('click', () => {
        editForm.style.display = 'none';
        document.getElementById('userInfo').style.display = 'block';
    });

    // Validación del formulario antes de enviarlo
    editForm.addEventListener('submit', (event) => {
        const emailField = document.getElementById('editEmail');
        if (!emailField.value.includes('@')) {
            alert('Por favor ingresa un correo electrónico válido.');
            event.preventDefault();
            return;
        }
    });

    // Enviar los datos actualizados al servidor
    editForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const updatedData = {
            nombre: document.getElementById('editNombre').value,
            apellidos: document.getElementById('editApellido').value,
            email: document.getElementById('editEmail').value,
        };

        try {
            const response = await fetch('/perfil/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message || 'Información actualizada correctamente.');
                location.reload(); // Recargar la página para mostrar los datos actualizados
            } else {
                alert(result.message || 'Error al actualizar los datos.');
            }
        } catch (err) {
            console.error('Error al conectar con el servidor:', err);
            alert('Error al conectar con el servidor.');
        }
    });

    document.querySelector('input[type="file"]').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('preview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
});
