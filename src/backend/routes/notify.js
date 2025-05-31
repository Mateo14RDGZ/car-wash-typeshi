const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Configurar el transporte de correo
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'porongos84314@gmail.com', // Tu correo
        pass: process.env.EMAIL_PASSWORD // Configurar esta variable de entorno con tu contraseña de aplicación
    }
});

// Ruta para enviar notificaciones
router.post('/', async (req, res) => {
    try {
        const { to, subject, html } = req.body;

        // Enviar el correo
        await transporter.sendMail({
            from: 'porongos84314@gmail.com',
            to,
            subject,
            html
        });

        res.status(200).json({ message: 'Notificación enviada con éxito' });
    } catch (error) {
        console.error('Error al enviar la notificación:', error);
        res.status(500).json({ error: 'Error al enviar la notificación' });
    }
});

module.exports = router; 