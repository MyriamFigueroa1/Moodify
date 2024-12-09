const express = require('express');
const router = express.Router();
const { getDb } = require('../db/conn');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar almacenamiento en memoria para multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

const ensureAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.redirect('/login_registration');
    }
};
// Ruta para cargar la página de perfil
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const db = getDb();
        const user = await db.collection('usuarios').findOne({ email: req.session.user.email });

        if (!user) {
            req.session.destroy(() => res.redirect('/login_registration'));
            return;
        }
        const perfilImagen = user.perfilImagen
            ? `data:image/jpeg;base64,${user.perfilImagen.toString('base64')}`
            : '/images/default-profile.jpg'; // Imagen predeterminada
        // Convertir la imagen binaria a base64 si existe
        console.log('prueba: ');
        res.render('perfil', {
            nombre: user.nombre,
            apellido: user.apellidos,
            email: user.email,
            perfilImagen,
            message: req.session.message, // Pasar el mensaje de la sesión
            messageType: req.session.messageType 
        });
        req.session.message = null;
        req.session.messageType = null;

    } catch (err) {
        console.error('Error al cargar el perfil:', err);
        res.status(500).send('Error al cargar el perfil.');
    }
 });



// Ruta para subir la imagen de perfil
router.post('/upload', upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
             // Si no se ha subido ninguna imagen
             req.session.message = 'No se ha subido ninguna imagen.'; 
             req.session.messageType = 'danger'; 
             return res.redirect('/perfil'); 
        }

        const db = getDb();
        const email = req.session.user.email; // Usuario autenticado

        // Guardar el archivo como binario en la base de datos
        await db.collection('usuarios').updateOne(
            { email },
            { $set: { perfilImagen: req.file.buffer } } 
        );

        req.session.message = 'Imagen subida con éxito'; 
        req.session.messageType = 'success'; 

        console.log('Imagen subida y guardada en la base de datos:');
        console.log(`Imagen subida por el usuario: ${email}`);
        res.redirect('/perfil'); // Redirigir a la página de perfil
    } catch (err) {
        console.error('Error al actualizar la información:', err);
        req.session.message = 'Error al actualizar la información.'; 
        req.session.messageType = 'danger'; 
        res.redirect('/perfil'); 
        res.status(500).json({ message: 'Error al actualizar la información.' });
    }
});

// Ruta para actualizar los datos del perfil
router.post('/update', async (req, res) => {
    console.log('Ruta /perfil/update alcanzada');  
    try {
        const { nombre, apellidos, email } = req.body;
        console.log('Datos del formulario:', req.body);
        const db = getDb();

        await db.collection('usuarios').updateOne(
            { email: req.session.user.email },
            { $set: { nombre: nombre, apellidos: apellidos, email: email } }
        );

        req.session.user.nombre = nombre;
        req.session.user.apellidos = apellidos;
        req.session.user.email = email;

        console.log("Datos de la sesión actualizados:", req.session.user); 

        // Enviar respuesta JSON en lugar de redireccionar
        res.json({ message: 'Información actualizada correctamente.', ok: true });
    } catch (err) {
        console.error('Error al actualizar la información:', err);
        res.status(500).json({ message: 'Error al actualizar la información.' });
    }
});



module.exports = router;
