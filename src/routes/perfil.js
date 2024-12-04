const express = require('express');
const router = express.Router();
const { getDb } = require('../db/conn');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar almacenamiento para multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/uploads');
        
        // Crear la carpeta si no existe
        if (!fs.existsSync(uploadPath)) {
            console.log('La carpeta no existe. Creándola...');
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname); // Obtener la extensión del archivo
        const uniqueName = Date.now() + ext; // Crear un nombre único
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

// Middleware para verificar autenticación
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
        }

        res.render('perfil', {
            nombre: user.nombre,
            apellido: user.apellidos,
            email: user.email,
            perfilImagen: user.perfilImagen || '/images/default-profile.jpg', // Imagen predeterminada si no hay imagen
        });
    } catch (err) {
        console.error('Error al cargar el perfil:', err);
        res.status(500).send('Error al cargar el perfil.');
    }
});

// Ruta para subir la imagen de perfil
router.post('/upload', ensureAuthenticated, upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha subido ninguna imagen.' });
        }

        const imagePath = `/uploads/${req.file.filename}`; // Ruta relativa
        const db = getDb();

        // Guardar la ruta de la imagen en la base de datos
        await db.collection('usuarios').updateOne(
            { email: req.session.user.email },
            { $set: { perfilImagen: imagePath } }
        );

        console.log('Imagen subida y guardada en la base de datos:', imagePath);
        res.redirect('/perfil'); // Redirigir a la página de perfil
    } catch (err) {
        console.error('Error al subir la imagen:', err);
        res.status(500).json({ message: 'Error al subir la imagen.' });
    }
});

module.exports = router;
