const nodemailer = require('nodemailer');

// Configurar el transporter de correo
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'porongos84314@gmail.com',
        pass: process.env.EMAIL_PASSWORD
    }
});

// Función para enviar correo de confirmación
async function sendBookingConfirmation(booking) {
    // Solo correo al administrador
    const adminMailOptions = {
        from: 'porongos84314@gmail.com',
        to: 'porongos84314@gmail.com',
        subject: 'Nueva reserva recibida',
        html: `
            <h2>¡Nueva reserva!</h2>
            <ul>
                <li><b>Nombre:</b> ${booking.clientName}</li>
                <li><b>Fecha y hora:</b> ${new Date(booking.date).toLocaleString()}</li>
                <li><b>Vehículo:</b> ${booking.vehicleType}</li>
                <li><b>Patente:</b> ${booking.vehiclePlate}</li>
                <li><b>Servicio:</b> ${booking.serviceType}</li>
                <li><b>Precio:</b> ${booking.price}</li>
                <li><b>Extras:</b> ${booking.extras && booking.extras.length ? booking.extras.join(', ') : 'Ninguno'}</li>
            </ul>
        `
    };
    try {
        await transporter.sendMail(adminMailOptions);
        console.log('Correo de notificación enviado al administrador.');
    } catch (error) {
        console.error('Error al enviar correo al administrador:', error);
    }
}

module.exports = {
    sendBookingConfirmation
}; 