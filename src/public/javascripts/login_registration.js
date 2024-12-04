document.addEventListener('DOMContentLoaded', () => {
    // Manejo del formulario de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault(); // Evita el comportamiento predeterminado del formulario

            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries()); // Convierte los datos del formulario en un objeto JSON

            try {
                const response = await fetch(e.target.action, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data), // Arreglado: JSON.stringify en lugar de render.stringify
                });

                const result = await response.json(); // Convierte la respuesta en JSON

                if (response.ok) {
                    showMessage(result.message || 'Usuario registrado exitosamente.', 'success');
                    e.target.reset(); // Limpia el formulario
                } else {
                    showMessage(result.error || 'Ocurrió un error inesperado.', 'danger');
                }
            } catch (err) {
                console.error(err);
                showMessage('Error al conectar con el servidor.', 'danger');
            }
        });
    }

    // Ocultar y mostrar contraseña
    document.querySelectorAll('.toggle-password').forEach((toggle) => {
        toggle.addEventListener('click', () => {
            console.log('Icon clicked:', toggle);
            const targetId = toggle.getAttribute('data-target');
            const passwordField = document.getElementById(targetId);

            if (passwordField) {
                console.log('Target field found:', passwordField);
                if (passwordField.type === 'password') {
                    passwordField.type = 'text';
                    toggle.classList.remove('bi-eye-slash');
                    toggle.classList.add('bi-eye');
                } else {
                    passwordField.type = 'password';
                    toggle.classList.remove('bi-eye');
                    toggle.classList.add('bi-eye-slash');
                }
            } else {
                console.error('Target field not found for:', targetId);
            }
        });
    });
});

function showMessage(message, type) {
    const messageContainer = document.getElementById('registerMessage');
    if (messageContainer) {
        messageContainer.textContent = message; // Coloca el mensaje en el contenedor
        messageContainer.className = `alert alert-${type}`; // Cambia el tipo (success o danger)
        messageContainer.style.display = 'block'; // Asegúrate de que sea visible
        setTimeout(() => {
            messageContainer.style.display = 'none'; // Oculta el mensaje después de 3 segundos
        }, 3000); // Ocultar después de 3 segundos
    }
}
