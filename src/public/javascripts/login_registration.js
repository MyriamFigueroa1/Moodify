document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (response.ok) {
                    // Mostrar el nombre del usuario en el perfil
                    showUserName(result.nombre);

                    // Redirigir al perfil (opcional)
                    window.location.href = '/perfil';
                } else {
                    showMessage(result.error || 'Error al iniciar sesión.', 'danger');
                }
            } catch (error) {
                console.error('Error al conectar con el servidor:', error);
                showMessage('Error al conectar con el servidor.', 'danger');
            }
        });
    }

    // Mostrar el nombre del usuario en la página
    function showUserName(nombre) {
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay) {
            userNameDisplay.textContent = `Bienvenido, ${nombre}`;
            userNameDisplay.style.display = 'block';
        }
    }

    function showMessage(message, type) {
        const messageContainer = document.getElementById('loginMessage');
        if (messageContainer) {
            messageContainer.textContent = message;
            messageContainer.className = `alert alert-${type}`;
            messageContainer.style.display = 'block';
            setTimeout(() => {
                messageContainer.style.display = 'none';
            }, 3000);
        }
    }
});
